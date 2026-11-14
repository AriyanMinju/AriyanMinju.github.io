# Client accounts (Sign In / Sign Up): setup, about 10 minutes, free

**Working right now, without setup:**
- **Sign Up** sends the new client's name, email and company to your inbox (kamruzzamanmju@gmail.com),
  so you can follow up. No password is collected.
- **Sign In** tells visitors that client accounts are opening soon and asks them to use Sign Up.
- **Forgot?** sends you an email so you can help the person.

**After this setup**, visitors get real accounts: they create a password, confirm their email, sign in,
reset forgotten passwords, and optionally use Google. The top menu shows "Hi, Name" when they are signed in.
This uses **Supabase**, which has a free plan.

## 1. Create a Supabase project
1. Go to **supabase.com**, then **Start your project**, and sign in with GitHub.
2. Click **New project**. Name: `leads-expert`. Set a database password and save it somewhere safe.
   For the region, choose **Singapore** (closest to Dhaka). Then click **Create**.

## 2. Allow your website
1. Go to **Authentication**, then **URL Configuration**.
2. Set **Site URL** to `https://ariyanminju.github.io/`
3. Under **Redirect URLs**, add `https://ariyanminju.github.io/**`

## 3. Copy two values into index.html
1. Go to **Project Settings**, then **API**.
2. Copy the **Project URL** and the **anon public** key.
3. In `index.html`, search for `AUTH_CONFIG` and paste them in:

```js
const AUTH_CONFIG = {
  supabaseUrl: "https://YOUR-PROJECT.supabase.co",
  supabaseAnonKey: "YOUR-ANON-PUBLIC-KEY",
  google: false
};
```

The anon key is safe to put in a website. Never paste the **service_role** key.

## 4. (Optional) Sign in with Google
1. Go to **Authentication**, then **Providers**, then **Google**, and turn it on.
   Follow Supabase's steps to create a Google client ID and secret.
2. In `index.html`, set `google: true`.
   An "Or continue with Google" button will then appear.

## 5. Upload
Upload `index.html` to GitHub, then press Ctrl+Shift+R.

## Where to see your clients
- In Supabase, go to **Authentication**, then **Users**. Every account is listed there.
- You also get an email for each new sign-up.
