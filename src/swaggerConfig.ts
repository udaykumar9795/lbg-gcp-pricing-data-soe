import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Loan Details API',
      version: '1.0.0',
      description: 'API documentation for Loan Details',
    },
  },
  apis: ['./src/app.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;


