const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage for Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Simple JSON DB
const dbFile = path.join(__dirname, 'db.json');
function readDB() {
  if (!fs.existsSync(dbFile)) return { reports: [] };
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Distance helper (Haversine in km)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1); 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; 
  return d;
}
function deg2rad(deg) { return deg * (Math.PI/180); }

// Routes
app.post('/api/report', upload.array('images', 3), (req, res) => {
  const { category, description, city, state, lat, lng, reporter_contact } = req.body;
  const db = readDB();
  
  const newReport = {
    id: uuidv4(),
    ticket_id: `TIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    category,
    description,
    status: 'reported',
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    city: city || 'Unknown',
    state: state || 'Unknown',
    reporter_contact,
    images: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],
    status_history: [{
      status: 'reported',
      actor: 'citizen',
      note: 'Report created',
      timestamp: new Date().toISOString()
    }],
    created_at: new Date().toISOString()
  };

  db.reports.push(newReport);
  writeDB(db);

  res.json({ ticket_id: newReport.ticket_id, report_id: newReport.id });
});

app.get('/api/reports', (req, res) => {
  let db = readDB();
  const { status, lat, lng, radius } = req.query;
  
  let result = db.reports;
  if (status) {
    result = result.filter(r => r.status === status);
  }
  
  // Basic Spatial filtering mock
  if (lat && lng && radius) {
     const centerLat = parseFloat(lat);
     const centerLng = parseFloat(lng);
     const maxRadiusKm = parseFloat(radius);
     result = result.filter(r => getDistanceFromLatLonInKm(centerLat, centerLng, r.lat, r.lng) <= maxRadiusKm);
  }

  res.json(result);
});

app.get('/api/report/:id', (req, res) => {
  const db = readDB();
  const report = db.reports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'Not found' });
  res.json(report);
});

app.patch('/api/report/:id/status', (req, res) => {
  const { status, note, actor } = req.body;
  const db = readDB();
  const index = db.reports.findIndex(r => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  db.reports[index].status = status;
  db.reports[index].status_history.push({
    status,
    actor: actor || 'worker',
    note: note || '',
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json(db.reports[index]);
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
