const express = require('express');
const app = express();
const fs = require('fs');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const port = 3000;

app.get('/', async (req, res) => {
  let currentPage = 1; // Start from page 350
  const limit = 50; // Fetch 20 records at a time
  const url = 'https://api.starludo.club/api/v1/user/all';

  // CSV Writer configuration
  const csvWriter = createCsvWriter({
    path: 'usersData2.csv',
    header: [
      { id: 'user_type', title: 'User Type' },
      { id: 'Name', title: 'Name' },
      { id: 'aadhar_name', title: 'Aadhar Name' },
      { id: 'Email', title: 'Email' },
      { id: 'Phone', title: 'Phone' },
      { id: 'Wallet_balance', title: 'Wallet Balance' },
      { id: 'device_key', title: 'Device Key' },
      { id: 'referral', title: 'Referral' },
      { id: 'referral_code', title: 'Referral Code' },
      { id: 'holder_name', title: 'Holder Name' },
      { id: 'upi_id', title: 'UPI ID' },
      { id: 'account_number', title: 'Account Number' },
      { id: 'bank_name', title: 'Bank Name' },
      { id: 'ifsc_code', title: 'IFSC Code' },
      { id: 'address', title: 'Address' },
      { id: 'dob', title: 'Date of Birth' },
      { id: 'aadhar', title: 'Aadhar' },
      { id: 'token', title: 'Token' },
    ],
    append: true, // To append data to the CSV file after every batch
  });

  try {
    let isDataAvailable = true;

    // Fetch and save data in chunks
    while (isDataAvailable) {
      const config = {
        method: 'get',
        url: `${url}?page=${currentPage}&limit=${limit}`,
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IiIsInBob25lIjo5NzcyNjAyMzM5LCJ1c2VySWQiOiI2NmVmOTI3ZjEwNmZjNTdlMTJlZWE5MmYiLCJzZXNzaW9uSWQiOiI2NmVmOTI4ZjEwNmZjNTdlMTJlZjJlOTEiLCJ1c2VyVHlwZSI6IlVzZXIiLCJpYXQiOjE3MjY5NzY2NTUsImV4cCI6MzQ2MTcyOTMxMH0.0SfyiTfOlpKFnudimBoWmljlSD2SB1JWLgnJD_iLVeA',
        },
      };

      const response = await axios.request(config);
      const { result, totalCount } = response.data.data;

      // Check if result is available
      if (!result || result.length === 0) {
        isDataAvailable = false;
        break;
      }

      // Extract only the required fields
      const filteredData = result.map((user) => ({
        user_type: user.user_type,
        Name: user.Name,
        aadhar_name: user.aadhar_name,
        Email: user.Email,
        Phone: user.Phone,
        Wallet_balance: user.Wallet_balance,
        device_key: user.device_key,
        referral: user.referral,
        referral_code: user.referral_code,
        holder_name: user.holder_name,
        upi_id: user.upi_id,
        account_number: user.account_number,
        bank_name: user.bank_name,
        ifsc_code: user.ifsc_code,
        address: user.address,
        dob: user.dob,
        aadhar: user.aadhar,
        token: user.token,
      }));

      // Write the current batch of data to CSV
      await csvWriter.writeRecords(filteredData);
      console.log(`Saved ${filteredData.length} records from page ${currentPage}`);

      // Increment page counter
      currentPage++;

      // If the result is less than limit, we've reached the last page
      if (filteredData.length < limit) {
        isDataAvailable = false;
      }
    }

    res.send('Data saved to usersData2.csv in batches.');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data from API');
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
