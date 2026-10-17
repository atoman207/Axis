"use client";

import { Component, type ReactNode } from "react";

/**
 * WebGL can be missing or blocked (old devices, locked-down browsers). 3D scenes are
 * decoration, so if one fails it simply disappears instead of taking the page down.
 */
export default class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
