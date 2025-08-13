import axios from 'axios';

// This line is the key.
// It says: "Look for the API address in my deployment settings. 
// If you can't find one (because I'm on my local computer), then use localhost."
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// ... (the rest of the file with the interceptor)```

This code is perfect. It does not contain your actual Render link. It only contains a **placeholder**: `process.env.REACT_APP_API_URL`.

### **Where You Tell Netlify the Address**

Now, you need to tell Netlify what value to use for that placeholder.

1.  **Log in to Netlify.**
2.  Go to your `fixtrack_frontend` site.
3.  Go to **Site settings > Build & deploy > Environment**.
4.  Click **"Edit variables"**.
5.  Add a **new variable**:
    *   **Key:** `REACT_APP_API_URL`
    *   **Value:** `https://fixtrack-backend.onrender.com/api`  *(Use your actual Render backend URL)*



When Netlify builds your frontend app, it will see `process.env.REACT_APP_API_URL` in your code and automatically replace it with the value you provided in the settings.

### **Summary: Why This is a "Yes"**

*   **Does the frontend need to know the backend's address?** Yes, absolutely.
*   **Do you write the address directly in the code?** No, never.
*   **How do you provide the address?** You use a placeholder (`process.env.REACT_APP_API_URL`) in your code and then set the actual value of that placeholder in your Netlify hosting environment.

This keeps your code secure (no secret URLs in your GitHub) and flexible (if your backend URL ever changes, you only have to update it in your Netlify settings, not in your code).
