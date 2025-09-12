"use client";
import { useMemo, useEffect } from "react";
import React from "react";

const ImagePreview = React.memo(({ file }: { file: File }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <img
      src={url}
      alt={`preview-${file.name}`}
      className="h-full w-full rounded-md opacity-[0.8]"
    />
  );
});

export default ImagePreview;
