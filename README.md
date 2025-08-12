Practice Project from https://courses.learncodeonline.in/learn/Pro-Backend-Developer-course by @hiteshchoudhary

An enterprise level Ecommerce site backend API representing using Swagger UI. 

### Installation :

Setup `.env` in root directory with following env variables,
```
PORT=4000 // app.listen() 

DB_URL=mongodb://127.0.0.1:27017/<tshirtstore - database name>

JWT_SECRET= // for authorisation token management
JWT_EXPIRY=3d 
COOKIE_TIME=3

// Get it from cloudinary.com
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

// Get it from Mailtrap.io
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_SENDER=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

// Get it from stripe.com
STRIPE_API_KEY=
STRIPE_SECRET=

// Get it from razorpay.com
RAZORPAY_API_KEY=
RAZORPAY_SECRET=
```

1. `npm install`
2. `npm run start / dev` (production/dev mode)
3. Visit `http://localhost:4000/`

### Tech Stack used :
1. node `v18.16.0`
2. npm `v9.7.1`
3. mongodb `v6.0.8`
4. cloudinary.com - for file-upload service testing 
5. Mailtrap.io - for email service testing
6. Stripe/RazorPay - for payment service testing
