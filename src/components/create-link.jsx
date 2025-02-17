import { UrlState } from "@/context";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Error from "./error";
import { Card } from "./ui/card";
import * as yup from "yup";
import QRCode from "react-qr-code";
import useFetch from "@/hooks/use-fetch";
import { createUrl } from "@/db/apiUrls";
import { BeatLoader } from "react-spinners";

const CreateLink = () => {
  const { user } = UrlState();
  const navigate = useNavigate();

  const ref = useRef();

  let [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [formValues, setFormValues] = useState({
    title: "",
    longUrl: longLink ? longLink : "",
    customUrl: "",
  });

  const schema = yup.object().shape({
    title: yup.string().required("Title is required"),
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long URL is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
  };

  //-----changed--------------------------
  const [open, setOpen] = useState(!!longLink);

  const {
    loading,
    error,
    data,
    fn: fnCreateUrl,
  } = useFetch(createUrl, { ...formValues, user_id: user?.id });



  useEffect(() => {
    console.log("Effect triggered. Data:", data, "Error:", error);
      if (error === null && data && data[0]?.id) {
     console.log("Success! Redirecting...");
      setOpen(false);
      navigate(`/link/${data[0].id}`);
      } else if (error) {
      console.log("Error occurred:", error);
      }
    }, [error, data, navigate]);

  const createNewLink = async () => {
    if (!formValues) return;

    setErrors({});
    try {
      await schema.validate(formValues, { abortEarly: false });

      //
       
      // /* --code starts
      // const canvas = ref.current.canvasRef.current;
      const canvas = document.createElement("canvas");
     const blob = await new Promise((resolve) => canvas.toBlob(resolve));
    //  await fnCreateUrl(blob);
      // --code ends */
      // const ctx = canvas.getContext("2d");
      // canvas.width = 250;
      // canvas.height = 250;
      // const svgData = new XMLSerializer().serializeToString(svg);
      // console.log("Serialized SVG Data:", ctx, svgData); //debug

      // // const svgUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
      // const svgUrl = `data:image/svg+xml;base64,${btoa(
      //   unescape(encodeURIComponent(svgData))
      // )}`;
      // console.log("SVG URL:", svgUrl); //debug

      // const blob = await new Promise((resolve, reject) => {
      //   const img = new Image();
      //   img.onload = () => {
      //     ctx.fillStyle = "white";
      //     ctx.fillRect(0, 0, canvas.width, canvas.height);
      //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      //     console.log(
      //       "Canvas verification:",
      //       canvas,
      //       canvas.width,
      //       canvas.height
      //     ); //debug
      //     canvas.toBlob(
      //       async (blob) => {
      //         if (blob) {
      //           resolve(blob);
      //         } else {
      //           console.error("Failed to create blob");
      //           reject(new Error("Blob creation failed"));
      //         }
      //       },
      //       "image/png",
      //       1.0
      //     );
      //   };
      //   img.onerror = () => {
      //     console.error("Failed to load the image for blob creation"); //debug
      //     reject(new Error("Image loading failed"));
      //   };
      //   img.src = svgUrl;
      // });


      await fnCreateUrl(
        {
          title: formValues.title,
          longUrl: formValues.longUrl,
          customUrl: formValues.customUrl,
          user_id: user.id,
        },
        blob
      );

    } catch (e) {
      
      const newErrors = {};
      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
    }
  };

  
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setSearchParams([]);
        }
      }}
      className="sm:max-w-md"
    >
      <DialogTrigger>
        <Button
          title="Create Link"
          className=" border-2 border-[#36d7b7] rounded-2xl
            bg-white text-black
            hover:bg-[#36d7b7] hover:text-white hover:font-semibold
            transform hover:scale-105
            transition-all duration-300 ease-in-out
            shadow-md hover:shadow-lg hover:shadow-[#36d7b7]/50"
          variant="destructive"
        >
          Create New Link
        </Button>
      </DialogTrigger>
      <DialogContent
        className="!rounded-2xl
    border-1 border-[#36d7b7] 
    bg-white dark:bg-gray-900
    hover:border-[2.5px]
    shadow-md hover:shadow-lg hover:shadow-[#36d7b7]/30
    transform hover:scale-105
    transition-all duration-300 ease-in-out
    [&>button]:text-red-500 dark:[&>button]:text-white
    [&>button:hover]:text-3xl 
    [&>button:hover]:text-red-700 dark:[&>button:hover]:text-gray-300
    [&>button]:transition-all [&>button]:duration-300"
      >
        <DialogHeader>
          <DialogTitle
            className="text-blue-600 font-semibold hover:font-bold text-2xl
                hover:text-[#36d7b7]"
          >
            Create New?
          </DialogTitle>
        </DialogHeader>

        {formValues?.longUrl && (
          <div className=" p-4 rounded-xl flex items-center">
            <QRCode
              value={formValues?.longUrl}
              size={250}
              ref={ref}
              className="transition-colors duration-300 flex items-center justify-center"
              bgColor="white"
              fgColor="#36d7b7"
            />
          </div>
        )}

        <Input
          id="title"
          title="Enter Title of the link"
          placeholder="Short Link's Title"
          value={formValues.title}
          onChange={handleChange}
          className="text-gray-900 dark:text-white bg-gray-50 dark:bg-transparent 
          border-2 border-[#36d7b7] rounded-xl
          focus:ring-2 focus:ring-[#36d7b7]/50 focus:border-[#36d7b7]
          hover:border-[#36d7b7]/70
          transform hover:scale-[1.02]
          transition-all duration-300
          placeholder:text-gray-500"
        />

        {errors.title && <Error message={errors.title} />}

        <Input
          id="longUrl"
          title="Enter your Long URL"
          placeholder="Enter your Loooong URL"
          value={formValues.longUrl}
          onChange={handleChange}
          className="text-gray-900 dark:text-white bg-gray-50 dark:bg-transparent 
          border-2 border-[#36d7b7] rounded-xl
          focus:ring-2 focus:ring-[#36d7b7]/50 focus:border-[#36d7b7]
          hover:border-[#36d7b7]/70
          transform hover:scale-[1.02]
          transition-all duration-300
          placeholder:text-gray-500"
        />
        {errors.longUrl && <Error message={errors.longUrl} />}

        <div className="flex items-center gap-2">
          <Card className="p-2">trXmmr.in </Card>

          <div className="text-black">/</div>
          <Input
            id="customUrl"
            title="Enter custom link"
            placeholder=" Custom Link (optional)"
            value={formValues.customUrl}
            onChange={handleChange}
            className="text-gray-900 dark:text-white bg-gray-50 dark:bg-transparent 
          border-2 border-[#36d7b7] rounded-xl
          focus:ring-2 focus:ring-[#36d7b7]/50 focus:border-[#36d7b7]
          hover:border-[#36d7b7]/70
          transform hover:scale-[1.02]
          transition-all duration-300
          placeholder:text-gray-500"
          />
        </div>

        {error && <Error message={error.message} />}

        <DialogFooter className=" sm:justify-start ">
          <Button
            disabled={loading}
            onClick={createNewLink}
            title="Create shortened link..."
            className="rounded-2xl border-2 border-[#36d7b7] 
            bg-white text-black
            hover:bg-[#36d7b7] hover:text-white hover:font-semibold
            transform hover:scale-105
            transition-all duration-300 ease-in-out
            shadow-md hover:shadow-lg hover:shadow-[#36d7b7]/50"
            variant="destructive"
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLink;
