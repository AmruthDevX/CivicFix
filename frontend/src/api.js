import { supabase } from './lib/supabase';

// Helper to reliably get current user id
const getUserId = async () => {
   const { data: { session } } = await supabase.auth.getSession();
   return session?.user?.id;
};

export const getReports = async (filters = {}) => {
  let query = supabase.from('reports').select(`*, status_history(*)`).order('created_at', { ascending: false });
  
  if (filters.user_id) {
     query = query.eq('user_id', filters.user_id);
  }
  if (filters.status) {
     query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Return in a format compatible with old axios responses
  return { data };
};

export const submitReport = async (formData) => {
  const user_id = await getUserId();
  if (!user_id) throw new Error('Not authenticated');

  // 1. Upload Images to Supabase Storage if any
  const imageFiles = formData.getAll('images');
  const imageUrls = [];
  
  for (const file of imageFiles) {
     const fileExt = file.name.split('.').pop();
     const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
     const { data, error } = await supabase.storage.from('issue_images').upload(fileName, file);
     
     if (error) {
        console.error("Supabase Storage Error:", error);
        throw new Error(`Cloud Storage blocked the image upload: ${error.message}. Please check your Bucket Policies.`);
     }

     const { data: { publicUrl } } = supabase.storage.from('issue_images').getPublicUrl(fileName);
     imageUrls.push(publicUrl);
  }

  // 2. Insert into Reports
  const reportData = {
     user_id,
     ticket_id: `TIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
     category: formData.get('category'),
     description: formData.get('description'),
     status: 'reported',
     lat: parseFloat(formData.get('lat')),
     lng: parseFloat(formData.get('lng')),
     images: imageUrls
  };

  const { data: insertedReport, error: insertError } = await supabase.from('reports').insert(reportData).select().single();
  if (insertError) throw insertError;

  // 3. Insert initial history
  await supabase.from('status_history').insert({
     report_id: insertedReport.id,
     status: 'reported',
     actor: 'citizen',
     note: 'Report created'
  });

  return { data: insertedReport };
};

export const updateStatus = async (id, payload) => {
  // Update report
  const { error: updateError } = await supabase.from('reports').update({ status: payload.status }).eq('id', id);
  if (updateError) throw updateError;

  // Add history
  const { error: histError } = await supabase.from('status_history').insert({
     report_id: id,
     status: payload.status,
     actor: payload.actor || 'worker',
     note: payload.note || 'Status updated via admin panel'
  });
  if (histError) throw histError;

  return { success: true };
};

export const signOut = () => supabase.auth.signOut();

export const toggleUpvote = async (id, currentUpvotes) => {
  const { data, error } = await supabase
    .from('reports')
    .update({ upvotes: (currentUpvotes || 0) + 1 })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getComments = async (reportId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('report_id', reportId)
    .order('timestamp', { ascending: true });
  
  if (error) throw error;
  return { data };
};

export const postComment = async (reportId, content) => {
  const user_id = await getUserId();
  const { data, error } = await supabase
    .from('comments')
    .insert({ report_id: reportId, user_id, content })
    .select()
    .single();
  
  if (error) throw error;
  return { data };
};
