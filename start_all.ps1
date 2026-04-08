Start-Process -FilePath "Wait" -ArgumentList "node", "server.js" -WorkingDirectory ".\backend" -NoNewWindow -PassThru
Start-Process -FilePath "Wait" -ArgumentList "npm", "run dev" -WorkingDirectory ".\frontend" -NoNewWindow -PassThru
echo "Backend running on http://localhost:3001"
echo "Frontend running on http://localhost:5173"
