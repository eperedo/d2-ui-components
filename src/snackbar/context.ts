import React from "react";
import { SnackbarState } from "./types";

export default React.createContext<SnackbarState | undefined>(undefined);
