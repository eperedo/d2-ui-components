import React from "react";
import { LoadingState } from "./types";

export default React.createContext<LoadingState | undefined>(undefined);
