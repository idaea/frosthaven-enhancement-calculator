import GloomhavenIconComponent from "./gloomhavenIcon";

export function DotExplanations() {
	return (
		<div className="mt-4">
			<b>Enhancement dot meanings:</b>
			<ul>
				<li>
					<b>Square:</b> Can only receive a{" "}
					<GloomhavenIconComponent
						width="16px"
						icon="enhancementPlusOne"
					/>{" "}
					sticker
				</li>
				<li>
					<b>Circle:</b> As <b>Square</b>, plus any element sticker.
				</li>
				<li>
					<b>Diamond:</b> As <b>Circle</b>, plus any negative condition
					sticker.
				</li>
				<li>
					<b>Diamond+:</b> As <b>Circle</b>, plus any positive condition
					sticker.
				</li>
			</ul>
		</div>
	);
}

function Square() {
	return <DotIcon char="□" />;
}

function Circle() {
	return <DotIcon char="○" />;
}

function Diamond() {
	return <DotIcon char="◇" />;
}

function DiamondPlus() {
	return <DotIcon char="◈" />;
}

function DotIcon({ char }: { char: string }) {
	return (
		<span
			style={{
				fontSize: "24px",
				display: "inline-block",
				width: 16,
				height: 16,
			}}
		>
			{char}
		</span>
	);
}
