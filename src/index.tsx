import React from "react";
import ReactDOM from "react-dom/client";
import { EnhancementCalculator } from "./js/calculator";
import "./scss/calculator.scss";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);

root.render(
	<React.StrictMode>
		<EnhancementCalculator />
	</React.StrictMode>
);
