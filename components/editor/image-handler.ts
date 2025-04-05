import { Editor } from "@tiptap/react";

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const handleImageUpload = async (
  file: File
): Promise<ImageUploadResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return { success: true, url: data.url };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export const insertImage = async (
  editor: Editor | null,
  file: File,
  onError?: (error: string) => void
) => {
  if (!editor || !file) return;

  if (!file.type.startsWith("image/")) {
    onError?.("Please select an image file");
    return;
  }

  // Create a temporary local URL for immediate preview
  const localUrl = URL.createObjectURL(file);
  editor.chain().focus().setImage({ src: localUrl }).run();

  // Upload the image and update the URL once complete
  const { success, url, error } = await handleImageUpload(file);

  if (success && url) {
    // Find and replace the temporary image with the uploaded one
    const content = editor.getHTML();
    const updatedContent = content.replace(localUrl, url);
    editor.commands.setContent(updatedContent);
  } else {
    onError?.(error || "Failed to upload image");
    // Remove the temporary image if upload failed
    const content = editor.getHTML();
    const updatedContent = content.replace(`<img src="${localUrl}"`, "");
    editor.commands.setContent(updatedContent);
  }

  // Clean up the temporary URL
  URL.revokeObjectURL(localUrl);
};
