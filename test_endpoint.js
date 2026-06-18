const axios = require('axios');

const fs = require('fs');

const testEndpoint = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/ai/recommend', {
      userQuery: "Find a beachfront villa under ₹5000"
    });
    fs.writeFileSync('response.json', JSON.stringify({
      status: response.status,
      headers: response.headers,
      data: response.data
    }, null, 2));
    console.log("SUCCESS");
  } catch (error) {
    if (error.response) {
      fs.writeFileSync('response.json', JSON.stringify({
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      }, null, 2));
    } else {
      fs.writeFileSync('response.json', JSON.stringify({
        error: error.message
      }, null, 2));
    }
    console.log("ERROR");
  }
};

testEndpoint();
