"use client";

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export function NavigationProgressBar() {
  return (
    <ProgressBar
      height="3px"
      color="#6366f1"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
