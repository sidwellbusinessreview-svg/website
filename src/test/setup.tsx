import React from "react";
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (
    imageProps: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    },
  ) => {
    const { alt, ...props } = imageProps;
    delete props.fill;
    delete props.priority;
    return React.createElement("img", { alt, ...props });
  },
}));
