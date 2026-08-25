import { supabase } from "../config/supabase.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, mobile, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          mobile: mobile || null,
          address: address || null
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: data.user?.id,
        email: data.user?.email
      },
      session: data.session
    });
  } catch (error) {
    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: "http://localhost:5173/reset-password",
      }
    );

    if (error) {
      console.error("Forgot password error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error) {
      console.error("Get profile error:", error);

      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    return res.json({
      success: true,
      user: data
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};