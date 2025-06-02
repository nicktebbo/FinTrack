import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Setup authentication middleware
export async function setupAuth(app: Express) {
  app.use(session(sessionConfig));

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      (req.session as any).user = {
        claims: {
          sub: data.user?.id,
          email: data.user?.email
        }
      };

      return res.json({ user: data.user });
    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(401).json({ message: error.message || 'Authentication failed' });
    }
  });

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) throw error;
      return res.json({ user: data.user });
    } catch (error: any) {
      console.error('Registration error:', error);
      return res.status(400).json({ message: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: 'Failed to logout' });
      res.json({ success: true });
    });
  });
}

// Auth guard
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as any).user;
  if (!user) return res.status(401).json({ message: 'Authentication required' });
  next();
}
