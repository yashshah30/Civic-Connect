import { createClient } from "@supabase/supabase-js";

export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      department_id,
      latitude,
      longitude,
      address,
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, description and category are required",
      });
    }

    const authenticatedSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`,
          },
        },
      }
    );

    // 1. Create the complaint
    const { data: complaint, error: complaintError } =
      await authenticatedSupabase
        .from("complaints")
        .insert({
          user_id: req.user.id,
          title,
          description,
          category,
          priority: priority || "medium",
          status: "submitted",
          department_id: department_id || null,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          address: address || null,
        })
        .select()
        .single();

    if (complaintError) {
      console.error("Create complaint error:", complaintError);

      return res.status(400).json({
        success: false,
        message: complaintError.message,
      });
    }

    // 2. Upload complaint images
    const uploadedMedia = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const safeFileName = file.originalname.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        );

        const filePath = `${req.user.id}/${complaint.id}/${Date.now()}-${safeFileName}`;

        const { error: uploadError } =
          await authenticatedSupabase.storage
            .from("complaint-images")
            .upload(filePath, file.buffer, {
              contentType: file.mimetype,
              upsert: false,
            });

        if (uploadError) {
          console.error("Image upload error:", uploadError);

          // Remove complaint if image upload fails
          await authenticatedSupabase
            .from("complaints")
            .delete()
            .eq("id", complaint.id);

          return res.status(400).json({
            success: false,
            message: `Failed to upload image: ${uploadError.message}`,
          });
        }

        // 3. Create public URL
        const { data: publicUrlData } =
          authenticatedSupabase.storage
            .from("complaint-images")
            .getPublicUrl(filePath);

        const fileUrl = publicUrlData.publicUrl;

        // 4. Save image information in complaint_media
        const { data: media, error: mediaError } =
          await authenticatedSupabase
            .from("complaint_media")
            .insert({
              complaint_id: complaint.id,
              file_url: fileUrl,
              file_type: "image",
              file_name: file.originalname,
            })
            .select()
            .single();

        if (mediaError) {
          console.error("Complaint media error:", mediaError);

          return res.status(400).json({
            success: false,
            message: `Image uploaded but media record failed: ${mediaError.message}`,
          });
        }

        uploadedMedia.push(media);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Complaint created successfully",
      complaint,
      media: uploadedMedia,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};