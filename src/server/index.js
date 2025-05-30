const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', '..', 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.htm'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 
