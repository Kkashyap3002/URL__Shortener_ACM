// Code to interact with the URLs table in the database
import supabase, { supabaseUrl } from "./supabase";

export async function getUrls(user_id) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error.message);
    throw new Error("Unable to load URLs");
  }

  return data;
}

export async function deleteUrl(id) {
  const { data, error } = await supabase.from("urls").delete("*").eq("id", id);

  if (error) {
    console.error(error.message);
    throw new Error("Unable to delete URLs");
  }

  return data;
}

export async function createUrl(
  { title, longUrl, customUrl, user_id },
  qrcode
) {
  const short_url = Math.random().toString(36).substring(2, 6);

  const fileName = `qr-${short_url}.png`;
  const { error: storageError } = await supabase.storage
    .from("qrs")
    .upload(fileName, qrcode);

  if (storageError) throw new Error(storageError.message);

  const qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;
  const { data, error } = await supabase
    .from("urls")
    .insert([
      {
        original_url: longUrl,
        short_url,
        custom_url: customUrl || null,
        user_id,
        title,
        qr,
      },
    ])
    .select();

  if (error) {
    console.error(error.message);
    throw new Error("Error creating short URL. Try new custom input, old one already there");
  }

  return data;
}

export async function getLongUrl(id) {
  const { data, error } = await supabase
  .from("urls")
  .select("id, original_url")
  .or(`short_url.eq.${id}, custom_url.eq.${id}`)
  .single();

  if (error) {
    console.error(error.message);
    throw new Error("Error fetching short link");
  }

  return data;
}

export async function getUrl({id, user_id}) {
  const { data, error } = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(error.message);
    throw new Error("Short URL not found");
  }

  return data;
}

