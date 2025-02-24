import express from "express";
import { Request, Response } from 'express-serve-static-core';
import { Storage } from "@google-cloud/storage";
import { BigQuery } from "@google-cloud/bigquery";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';
// import { Pool } from 'pg';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const port = 3000;

// Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(__dirname, 'playpen-122b3f-d1a4dadaa8c8.json');

const keyFilePath = path.join(__dirname,'../src/playpen-122b3f-d1a4dadaa8c8.json');

if(!fs.existsSync(keyFilePath)) {
    process.exit(1);
    }

    console.log(`Key file found: ${keyFilePath}`);

// Create a storage client
const storage = new Storage({
    projectId: 'playpen-122b3f',
    keyFilename: keyFilePath
    });
// Create a BigQuery client
const bigquery = new BigQuery({
    projectId: 'playpen-122b3f',
    keyFilename: keyFilePath
    });

app.get('/', (req, res) => {
  res.send('Hello World!--------------------------->');
});

app.get('/bigquery-data', async (req, res) => {
  const query = `SELECT * FROM \`${'ap_edhcon_dev_01_bqd_euwe2_mspstg_01'}.${'Mortgage_loan_table'}\` where EDH_PARTITION_DT between '2023-01-01' and '2025-01-01' LIMIT 10`;
console.log(query);
  try {
    const [rows] = await bigquery.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error querying BigQuery:', error);
    res.status(500).send('Error querying BigQuery');
  }
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

app.get('/postgres-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "pricingschema"."loan_details"');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Add a new endpoint to fetch data based on email_id

app.get('/postgres-data-by-email', async (req: Request, res: Response) => {
  const emailId = req.query.email_id;
  if (!emailId) {
      return res.status(400).send('email_id query parameter is required');
  }

  try {
      const result = await pool.query('SELECT * FROM "pricingschema"."loan_details" WHERE "email_id" = $1', [emailId]);
      if (result.rows.length === 0) {
        return res.status(404).send('No records found with the given email_id');
    }
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});