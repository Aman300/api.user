const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const port = 3000;

app.get('/', async (req, res) => {
  let currentPage = 11; //done by 10 next 11 page start
  const limit = 100; // Fetch 20 records at a time
  const url = 'https://api.starludo.club/api/v1/user/all';

  // CSV Writer configuration
  const csvWriter = createCsvWriter({
    path: 'usersData.csv',
    header: [
      { id: 'user_type', title: 'User Type' },
      { id: 'Name', title: 'Name' },
      { id: 'aadhar_name', title: 'Aadhar Name' },
      { id: 'otp', title: 'OTP' },
      { id: 'Email', title: 'Email' },
      { id: 'Email_varified_at', title: 'Email Verified At' },
      { id: 'sessionID', title: 'Session ID' },
      { id: 'Phone', title: 'Phone' },
      { id: 'Mobile_varified_at', title: 'Mobile Verified At' },
    ],
    append: true, // To append data to the CSV file after every batch
  });

  try {
    let totalCount = 0;
    let isDataAvailable = true;

    // Fetch and save data in chunks
    while (isDataAvailable) {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${url}?page=${currentPage}&limit=${limit}`,
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IiIsInBob25lIjo3MzI0ODIxNTM0LCJ1c2VySWQiOiI2NmRlZjYzNDJkOWExNmM2OWI4YmNkNWYiLCJzZXNzaW9uSWQiOiI2NmVjNjcyZTc1NWI2ZDE5NTgyNjViODMiLCJ1c2VyVHlwZSI6IlVzZXIiLCJpYXQiOjE3MjY3Njg5NDIsImV4cCI6MzQ2MTMxMzg4NH0.IP4cOj85HW4iTaPDJ2wG5v4nNBNok5OCU42Vetd6hAA',
        },
      };

      const response = await axios.request(config);
      const { result, totalCount: total } = response.data.data;

      // Extract only the required fields
      const filteredData = result.map((user) => ({
        user_type: user.user_type,
        Name: user.Name,
        aadhar_name: user.aadhar_name,
        otp: user.otp,
        Email: user.Email,
        Email_varified_at: user.Email_varified_at,
        sessionID: user.sessionID,
        Phone: user.Phone,
        Mobile_varified_at: user.Mobile_varified_at,
      }));

      // Write the current batch of data to CSV
      await csvWriter.writeRecords(filteredData);
      console.log(
        `Saved ${filteredData.length} records from page ${currentPage}`
      );

      // Increment page counter and check if there's more data to fetch
      currentPage++;
      totalCount = total;

      // If the result is less than limit, we've reached the last page
      if (filteredData.length < limit) {
        isDataAvailable = false;
      }
    }

    res.send('Data saved to usersData.csv in batches.');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data from API');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
