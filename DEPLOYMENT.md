# Deployment Guide

## Environment Configuration

### Development

- API URL: `http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com`
- Used when running `npm start`

### Production

- API URL: Set via `REACT_APP_API_URL` environment variable
- Used when running `npm run build:prod`

## Steps to Deploy

### 1. Configure Backend API URL

The production API URL is already configured in `src/config/api.js`:

```javascript
production: {
  baseURL: 'http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com',
  timeout: 15000,
}
```

### 2. Build for Production

```bash
# Option 1: Using the build:prod script
npm run build:prod

# Option 2: Set environment variable manually
REACT_APP_API_URL=http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com npm run build

# Option 3: Start development with production API
npm run start:prod
```

### 3. Deploy to AWS Elastic Beanstalk

1. Build the application using the production configuration
2. Upload the built files to your Elastic Beanstalk environment
3. Ensure your backend API is also deployed and accessible

## Environment Variables

### Required for Production

- `REACT_APP_API_URL`: Your backend API URL

### Optional

- `REACT_APP_ENV`: Environment name (development, staging, production)

## Troubleshooting

### API Connection Issues

1. Verify your backend API is running and accessible
2. Check CORS configuration on your backend
3. Ensure the API URL is correct in the configuration

### Build Issues

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear build cache: `npm run build -- --reset-cache`

## Current Deployment Status

- **Frontend**: ✅ Deployed on AWS Elastic Beanstalk
- **URL**: http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com/
- **Status**: Healthy (Green)
- **Backend**: ✅ Configured to connect to the same domain (default port 80)
- **API Endpoints**:
  - Health Check: `/actuator/health`
  - API Info: `/actuator/info`
  - Posts API: `/api/posts`
