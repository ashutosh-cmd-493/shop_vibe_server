const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "ARd7aXnteCIhuGV1B0kaNAb2y6io8r6aXfNk92W7WVWLBq_wVyz8muT8HaIHyNL_PKdo0pVU2D6MxCY0",
  client_secret: "EF4rmIpevHcMGxatuBx00UnQA7anjseG5K2g8-0x_Vt0tKWHPivuJWESbM8NynDRS1HYccz7xfdLNPio",
});

module.exports = paypal;
