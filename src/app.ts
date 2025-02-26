import express from "express";
import { RequestHandlerParams } from 'express-serve-static-core';
import { Request, Response } from 'express-serve-static-core';
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';
import path from "path";
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();
const port = 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Loan Details API',
      version: '1.0.0',
      description: 'API documentation to fetch data from Loan Details Table',
    },
    servers: [
      {
        url: `http://localhost:${port}/api`,
      },
    ],
  },
  apis: ['./src/app.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
// Set up Swagger
app.use('/api-docs', swaggerUi.serve as RequestHandlerParams, swaggerUi.setup(swaggerSpec) as RequestHandlerParams);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec) as express.RequestHandler);
/**
 * @swagger
 * /loan-details-data:
 *   get:
 *     summary: Retrieve all loan details
 *     responses:
 *       200:
 *         description: A list of loan details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The loan ID
 *                     example: 1
 *                   email_id:
 *                     type: string
 *                     description: The email ID associated with the loan
 *                     example: example@example.com
 */

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

app.get('/api/loan-details-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "pricingschema"."loan_details"');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


/**
 * @swagger
 * /loan-details-data-by-email:
 *   get:
 *     summary: Retrieve loan details by email ID
 *     parameters:
 *       - in: query
 *         name: email_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The email ID to filter loan details
 *     responses:
 *       200:
 *         description: A list of loan details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The loan ID
 *                     example: 1
 *                   email_id:
 *                     type: string
 *                     description: The email ID associated with the loan
 *                     example: example@example.com
 *       400:
 *         description: email_id query parameter is required
 *       404:
 *         description: No records found with the given email_id
 *       500:
 *         description: Server error
 */

// Add a new endpoint to fetch data based on email_id
app.get('/api/loan-details-data-by-email', async (req: Request, res: Response) => {
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