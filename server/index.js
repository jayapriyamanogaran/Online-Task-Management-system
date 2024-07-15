const express = require("express");
const app = express();

const port = 5002;
app.listen(port, () => {
    console.log(`server is running ${port}`);
})
app.get('/', (req, res) => {
    res.send('Task Management Backend');
});