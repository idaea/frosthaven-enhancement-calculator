import { ReactElement, ReactNode, useState } from "react";
import { Container, Row, Col, Button, Badge, Form } from "react-bootstrap";
import GloomhavenIcon from "./gloomhavenIcon";
import { capitalCase, pascalCase } from "change-case";
import { mapValues } from "lodash";

const iconWidth = "16px";

interface Effect {
	cost: number;
	costLow: number;
	title: string;
	icon: string;
}

function buildEffects<TKey extends string>(
	rawDefinitions: Record<
		TKey,
		{
			cost: number;
			costLow: number;
			title?: string;
			icon?: string;
		}
	>
): Record<TKey, Effect> {
	return mapValues(rawDefinitions, ({ cost, costLow, title, icon }, key) => ({
		cost,
		costLow,
		title: title ?? capitalCase(key),
		icon: icon ?? `general${pascalCase(key)}`,
	}));
}

// "low" values from https://i.imgur.com/nEsIUvG.png
// recommended by FH dev here: https://www.reddit.com/r/Gloomhaven/comments/uo3som/comment/i8cej68/

const playerPlusOneAbilityLines = buildEffects({
	move: { cost: 30, costLow: 20 },
	attack: { cost: 50, costLow: 35 },
	range: { cost: 30, costLow: 20 },
	target: { cost: 75, costLow: 40 },
	shield: { cost: 80, costLow: 60 },
	retaliate: { cost: 60, costLow: 40 },
	pierce: { cost: 30, costLow: 15, icon: "statusEffectPierce" },
	heal: { cost: 30, costLow: 20 },
	push: { cost: 30, costLow: 20, icon: "statusEffectPush" },
	pull: { cost: 30, costLow: 15, icon: "statusEffectPull" },
	teleport: { cost: 30, costLow: 30 },
});

const summonPlusOneAbilityLines = buildEffects({
	hp: { cost: 40, costLow: 30, title: "HP", icon: "generalHeal" },
	move: { cost: 60, costLow: 40 },
	attack: { cost: 100, costLow: 60 },
	range: { cost: 50, costLow: 40 },
});

const baseOtherEffects = buildEffects({
	regenerate: {
		cost: 40,
		costLow: 40,
		icon: "statusEffectRegenerate",
	},
	ward: { cost: 40, costLow: 40, icon: "statusEffectWard" },
	strengthen: {
		cost: 100,
		costLow: 100,
		icon: "statusEffectStrengthen",
	},
	bless: { cost: 75, costLow: 50, icon: "statusEffectBless" },
	wound: { cost: 75, costLow: 45, icon: "statusEffectWound" },
	poison: { cost: 50, costLow: 30, icon: "statusEffectPoison" },
	immobilize: {
		cost: 150,
		costLow: 100,
		icon: "statusEffectImmobilize",
	},
	muddle: { cost: 40, costLow: 25, icon: "statusEffectMuddle" },
	curse: { cost: 150, costLow: 100, icon: "statusEffectCurse" },
	specificElement: {
		cost: 100,
		costLow: 60,
		icon: "elementFire",
	},
	anyElement: { cost: 150, costLow: 90, icon: "elementAll" },
	jump: { cost: 60, costLow: 35, icon: "generalJump" },
});

function generateNumericSequence(
	length: number,
	getVal: (i: number) => number
): number[] {
	return new Array(length).fill(0).map((_, i) => getVal(i));
}

const baseNewAttackHexCost = { default: 200, low: 150 };
const levelCost = {
	default: generateNumericSequence(9, (i) => i * 25),
	low: generateNumericSequence(9, (i) => i * 10),
};
const previousEnhancementCost = {
	default: generateNumericSequence(5, (i) => i * 75),
	low: generateNumericSequence(5, (i) => i * 20),
};

const stickerTypes = {
	playerPlus1: { title: "Player" },
	summonPlus1: { title: "Summon" },
	attackHex: { title: "Attack Hex" },
	otherEffect: { title: "Other Effect" },
};

export function EnhancementCalculator() {
	const [selectedStickerType, setSelectedStickerType] = useState(""); // +1 / summon +1 / attack hex / else
	const [selectedPlayerPlusOneEffect, setSelectedPlayerPlusOneEffect] =
		useState("");
	const [baseOtherEffect, setBaseOtherEffect] = useState("");
	const [summonPlusOneAbility, setSummonPlusOneAbility] = useState("");
	const [numberOfCurrentlyTargetedHexes, setNumberOfCurrentlyTargetedHexes] =
		useState(2);
	const [levelOfAbilityCard, setLevelOfAbilityCard] = useState(1);
	const [numberOfPreviousEnhancements, setNumberOfPreviousEnhancements] =
		useState(0);
	const [multipleTargets, setMultipleTargets] = useState(false);
	const [lostCard, setLostCard] = useState(false);
	const [persistentBonus, setPersistentBonus] = useState(false);
	const [useLowCosts, setUseLowCosts] = useState(false);

	function doubleMultipleTargets() {
		if (selectedStickerType === "attackHex") {
			return false;
		}

		if (baseOtherEffect === "specificElement") {
			return false;
		}

		if (baseOtherEffect === "anyElement") {
			return false;
		}

		if (selectedPlayerPlusOneEffect === "target") {
			return false;
		}

		return true;
	}

	function getEffectCost(effect: Effect): number {
		return useLowCosts ? effect.costLow : effect.cost;
	}

	function getScaledCost(
		costVariants: { default: number[]; low: number[] },
		i: number
	): number {
		return (useLowCosts ? costVariants.low : costVariants.default)[i];
	}

	function calculateCost() {
		let cost = 0;

		if (selectedStickerType === "playerPlus1") {
			if (selectedPlayerPlusOneEffect) {
				cost += getEffectCost(
					playerPlusOneAbilityLines[selectedPlayerPlusOneEffect]
				);
			} else {
				// cannot yet calculate
				return 0;
			}
		} else if (selectedStickerType === "summonPlus1") {
			if (summonPlusOneAbility) {
				cost += getEffectCost(
					summonPlusOneAbilityLines[summonPlusOneAbility]
				);
			} else {
				// cannot yet calculate
				return 0;
			}
		} else if (selectedStickerType === "attackHex") {
			cost += Math.floor(
				(useLowCosts
					? baseNewAttackHexCost.low
					: baseNewAttackHexCost.default) / numberOfCurrentlyTargetedHexes
			);
		} else if (selectedStickerType === "otherEffect") {
			if (baseOtherEffect) {
				cost += getEffectCost(baseOtherEffects[baseOtherEffect]);
			} else {
				// cannot yet calculate
				return 0;
			}
		} else {
			// no legal option selected
			return 0;
		}

		// double BASE COST if multiple targets (does not apply for attack hex)
		if (multipleTargets && doubleMultipleTargets()) {
			cost *= 2;
		}

		// halve BASE COST if lost
		if (lostCard) {
			cost /= 2;
		}

		// triple BASE COST if persistent bonus
		if (persistentBonus && selectedStickerType !== "summonPlus1") {
			cost *= 3;
		}

		// extra cost for level of ability card
		cost += getScaledCost(levelCost, levelOfAbilityCard - 1);

		// extra cost for previous enhancements to the same action
		cost += getScaledCost(
			previousEnhancementCost,
			numberOfPreviousEnhancements
		);

		return cost;
	}

	function stickerTypeClick(stickerType) {
		if (stickerType === selectedStickerType) {
			setSelectedStickerType("");
		} else {
			setSelectedStickerType(stickerType);
		}
	}

	function summonPlusOneAbilityClick(effect) {
		if (summonPlusOneAbility === effect) {
			setSummonPlusOneAbility("");
		} else {
			setSummonPlusOneAbility(effect);
		}
	}

	function baseOtherEffectClick(effect) {
		if (baseOtherEffect === effect) {
			setBaseOtherEffect("");
		} else {
			setBaseOtherEffect(effect);
		}
	}

	function playerPlusOneAbilityClick(abilityLine) {
		if (selectedPlayerPlusOneEffect === abilityLine) {
			setSelectedPlayerPlusOneEffect("");
		} else {
			setSelectedPlayerPlusOneEffect(abilityLine);
		}
	}

	function showOtherOptions() {
		if (selectedStickerType === "playerPlus1") {
			if (selectedPlayerPlusOneEffect) {
				return true;
			}
		} else if (selectedStickerType === "summonPlus1") {
			if (summonPlusOneAbility) {
				return true;
			}
		} else if (selectedStickerType === "attackHex") {
			return true;
		} else if (selectedStickerType === "otherEffect") {
			if (baseOtherEffect) {
				return true;
			}
		}

		return false;
	}

	function makeBadgeRow(text) {
		return (
			<Row>
				<Col xs={12} md={12} className="text-center instruction-label">
					{text}
				</Col>
			</Row>
		);
	}

	let cost = calculateCost();

	let enhancementTypeColumns: ReactElement[] = [];
	let playerPlusOneAbilityColumns: ReactElement[] = [];
	let baseOtherEffectColumns: ReactElement[] = [];
	let summonPlusOneAbilityColumns: ReactElement[] = [];
	let abilityCardLevelColumns: ReactElement[] = [];
	let previousEnhancementsColumns: ReactElement[] = [];
	let numberOfHexesColumns: ReactElement[] = [];

	for (let i = 2; i <= 13; i++) {
		numberOfHexesColumns.push(
			<Col className="enhancement-col" key={i} xs={4} md={3}>
				<Button
					variant="outline-secondary"
					block
					onClick={() => setNumberOfCurrentlyTargetedHexes(i)}
					className={
						numberOfCurrentlyTargetedHexes === i ? "active" : undefined
					}
				>
					{i} <GloomhavenIcon icon="generalAttackHex" width={iconWidth} />{" "}
					({Math.floor(200 / i)}g)
				</Button>
			</Col>
		);
	}

	for (let i = 0; i <= 3; i++) {
		previousEnhancementsColumns.push(
			<Col className="enhancement-col" key={i} xs={6} md={3}>
				<Button
					variant="outline-secondary"
					block
					onClick={() => setNumberOfPreviousEnhancements(i)}
					className={
						numberOfPreviousEnhancements === i ? "active" : undefined
					}
				>
					{i} (+{getScaledCost(previousEnhancementCost, i)}g)
				</Button>
			</Col>
		);
	}

	for (let i = 1; i <= 9; i++) {
		abilityCardLevelColumns.push(
			<Col
				className="enhancement-col"
				key={i}
				xs={4}
				md={2}
				lg={1}
				xl={true}
			>
				<Button
					variant="outline-secondary"
					block
					onClick={() => setLevelOfAbilityCard(i)}
					className={levelOfAbilityCard === i ? "active" : undefined}
				>
					{i} (+{getScaledCost(levelCost, i - 1)}g)
				</Button>
			</Col>
		);
	}

	for (let stickerType in stickerTypes) {
		if (stickerTypes.hasOwnProperty(stickerType)) {
			let type = stickerTypes[stickerType];

			let icons: ReactNode = "";
			if (stickerType === "attackHex") {
				icons = (
					<GloomhavenIcon icon="generalAttackHex" width={iconWidth} />
				);
			} else if (stickerType === "otherEffect") {
				icons = (
					<span>
						<GloomhavenIcon icon="elementFire" width={iconWidth} />
						<GloomhavenIcon icon="generalJump" width={iconWidth} />
						<GloomhavenIcon icon="statusEffectMuddle" width={iconWidth} />
					</span>
				);
			} else {
				icons = <GloomhavenIcon icon="generalPlusOne" width={iconWidth} />;
			}

			enhancementTypeColumns.push(
				<Col className="enhancement-col" key={stickerType} xs={6} md={3}>
					<Button
						variant="outline-secondary"
						block
						onClick={() => stickerTypeClick(stickerType)}
						className={
							stickerType === selectedStickerType ? "active" : undefined
						}
					>
						{type.title} {icons}
					</Button>
				</Col>
			);
		}
	}

	for (let baseOtherEffectKey in baseOtherEffects) {
		if (baseOtherEffects.hasOwnProperty(baseOtherEffectKey)) {
			let effect = baseOtherEffects[baseOtherEffectKey];

			let xs = 6;
			let md = 3;
			if (
				baseOtherEffectKey === "specificElement" ||
				baseOtherEffectKey === "anyElement" ||
				baseOtherEffectKey === "jump"
			) {
				xs = 12;
			}

			if (baseOtherEffectKey === "specificElement") {
				md = 6;
			}

			let icons = <GloomhavenIcon icon={effect.icon} width={iconWidth} />;
			if (baseOtherEffectKey === "specificElement") {
				icons = (
					<span>
						<GloomhavenIcon icon="elementAir" width={iconWidth} />
						<GloomhavenIcon icon="elementLight" width={iconWidth} />
						<GloomhavenIcon icon="elementIce" width={iconWidth} />
						<GloomhavenIcon icon="elementDark" width={iconWidth} />
						<GloomhavenIcon icon="elementFire" width={iconWidth} />
						<GloomhavenIcon icon="elementEarth" width={iconWidth} />
					</span>
				);
			}

			baseOtherEffectColumns.push(
				<Col
					className="enhancement-col"
					key={baseOtherEffectKey}
					xs={xs}
					md={md}
				>
					<Button
						variant="outline-secondary"
						block
						onClick={() => baseOtherEffectClick(baseOtherEffectKey)}
						className={
							baseOtherEffectKey === baseOtherEffect
								? "active"
								: undefined
						}
					>
						{effect.title} {icons} ({getEffectCost(effect)}g)
					</Button>
				</Col>
			);
		}
	}

	for (let playerPlusOneAbilityLine in playerPlusOneAbilityLines) {
		if (playerPlusOneAbilityLines.hasOwnProperty(playerPlusOneAbilityLine)) {
			let ability = playerPlusOneAbilityLines[playerPlusOneAbilityLine];

			playerPlusOneAbilityColumns.push(
				<Col
					className="enhancement-col"
					key={playerPlusOneAbilityLine}
					xs={6}
					md={2}
				>
					<Button
						variant="outline-secondary"
						block
						onClick={() =>
							playerPlusOneAbilityClick(playerPlusOneAbilityLine)
						}
						className={
							selectedPlayerPlusOneEffect === playerPlusOneAbilityLine
								? "active"
								: undefined
						}
					>
						{ability.title}{" "}
						<GloomhavenIcon icon={ability.icon} width={iconWidth} /> (
						{getEffectCost(ability)}g)
					</Button>
				</Col>
			);
		}
	}

	for (let summonPlusOneAbilityLine in summonPlusOneAbilityLines) {
		if (summonPlusOneAbilityLines.hasOwnProperty(summonPlusOneAbilityLine)) {
			let ability = summonPlusOneAbilityLines[summonPlusOneAbilityLine];

			summonPlusOneAbilityColumns.push(
				<Col
					className="enhancement-col"
					key={summonPlusOneAbilityLine}
					xs={6}
					md={3}
				>
					<Button
						variant="outline-secondary"
						block
						onClick={() =>
							summonPlusOneAbilityClick(summonPlusOneAbilityLine)
						}
						className={
							summonPlusOneAbility === summonPlusOneAbilityLine
								? "active"
								: undefined
						}
					>
						{ability.title}{" "}
						<GloomhavenIcon icon={ability.icon} width={iconWidth} /> (
						{getEffectCost(ability)}g)
					</Button>
				</Col>
			);
		}
	}

	return (
		<div className="container">
			<Container className="enhancement-container">
				<Row className="hidden-xs">
					<Col xs={12} md={12}>
						<p>
							Adapted from:{" "}
							<a href="https://ninjawithkillmoon.github.io/utilities/enhancementCalculator">
								The Arcane Library - Enhancement Calculator
							</a>
							.{" "}
							<a href="https://github.com/pikdonker/frosthaven-enhancement-calculator">
								Source
							</a>
						</p>
						<p>
							Each type of enhancement has a base cost. The cost might
							then be modified based on which ability is being enhanced.
						</p>
						<p>
							Some enhancements do not fall neatly into the categories on
							the cost chart. When determining their base cost, treat
							damage traps as "
							<GloomhavenIcon icon="generalAttack" width="12px" /> +1"
							enhancements (
							{getEffectCost(playerPlusOneAbilityLines.attack)} gold),
							treat healing traps as "
							<GloomhavenIcon
								alt="Heal Icon"
								icon="generalHeal"
								width="12px"
							/>{" "}
							+1" enhancements (
							{getEffectCost(playerPlusOneAbilityLines.heal)} gold), and
							treat the movement of tokens and tiles as "
							<GloomhavenIcon
								alt="Move Icon"
								icon="generalMove"
								width="12px"
							/>{" "}
							+1" enhancements (
							{getEffectCost(playerPlusOneAbilityLines.move)} gold).
						</p>
						<Form>
							<Form.Check
								label="Use lower costs"
								type="checkbox"
								id="useLowerCosts"
								checked={useLowCosts}
								onChange={(x) => {
									setUseLowCosts(x.target.checked);
								}}
							/>
						</Form>
					</Col>
				</Row>

				{makeBadgeRow("Enhancement Type")}

				<Row>{enhancementTypeColumns}</Row>

				{selectedStickerType === "playerPlus1" && (
					<div>
						<hr />
						{makeBadgeRow("Ability Line")}
						<Row>{playerPlusOneAbilityColumns}</Row>
					</div>
				)}

				{selectedStickerType === "summonPlus1" && (
					<div>
						<hr />
						{makeBadgeRow("Enhancement Effect")}
						<Row>{summonPlusOneAbilityColumns}</Row>
					</div>
				)}

				{selectedStickerType === "attackHex" && (
					<div>
						<hr />
						{makeBadgeRow(
							"Number of Hexes Currently Targeted with the Attack"
						)}
						<Row>{numberOfHexesColumns}</Row>
					</div>
				)}

				{selectedStickerType === "otherEffect" && (
					<div>
						<hr />
						{makeBadgeRow("Base Effect")}
						<Row>{baseOtherEffectColumns}</Row>
					</div>
				)}

				{showOtherOptions() && (
					<div>
						<hr />
						{makeBadgeRow("Level of Ability Card")}
						<Row>{abilityCardLevelColumns}</Row>
					</div>
				)}

				{showOtherOptions() && (
					<div>
						<hr />
						{makeBadgeRow(
							"Number of Previous Enhancements to the Same Action"
						)}
						<Row>{previousEnhancementsColumns}</Row>
					</div>
				)}

				{showOtherOptions() && doubleMultipleTargets() && (
					<div>
						<hr />
						{makeBadgeRow("Ability has Multiple Targets/Summons/Tokens")}
						<Row>
							<Col className="enhancement-col" xs={12} md={12}>
								<Button
									variant="outline-secondary"
									disabled={!doubleMultipleTargets()}
									block
									onClick={() => setMultipleTargets(!multipleTargets)}
									className={multipleTargets ? "active" : undefined}
								>
									{multipleTargets ? "Yes (Double base cost)" : "No"}
								</Button>
							</Col>
						</Row>
					</div>
				)}

				{showOtherOptions() && (
					<div>
						<hr />
						<Row>
							<Col
								xs={12}
								md={12}
								className="text-center instruction-label"
							>
								Ability has a Lost{" "}
								<GloomhavenIcon icon="generalLost" width={iconWidth} />,
								but no Persistent{" "}
								<GloomhavenIcon
									icon="generalPersistent"
									width={iconWidth}
								/>{" "}
								Icon
							</Col>
						</Row>
						<Row>
							<Col className="enhancement-col" xs={12} md={12}>
								<Button
									variant="outline-secondary"
									block
									onClick={() => setLostCard(!lostCard)}
									className={lostCard ? "active" : undefined}
								>
									{lostCard ? "Yes (Halve base cost)" : "No"}
								</Button>
							</Col>
						</Row>
					</div>
				)}

				{showOtherOptions() && selectedStickerType !== "summonPlus1" && (
					<div>
						<hr />
						<Row>
							<Col
								xs={12}
								md={12}
								className="text-center instruction-label"
							>
								Ability has a Persistent{" "}
								<GloomhavenIcon
									icon="generalPersistent"
									width={iconWidth}
								/>{" "}
								Icon
							</Col>
						</Row>
						<Row>
							<Col className="enhancement-col" xs={12} md={12}>
								<Button
									variant="outline-secondary"
									block
									onClick={() => setPersistentBonus(!persistentBonus)}
									className={persistentBonus ? "active" : undefined}
								>
									{persistentBonus ? "Yes (Triple base cost)" : "No"}
								</Button>
							</Col>
						</Row>
					</div>
				)}

				<hr />
				{makeBadgeRow("Enhancement Cost")}
				<Row className="cost-row">
					<Col className="enhancement-col text-center" xs={12} md={12}>
						{cost <= 0 && (
							<Badge className="badge-xxlarge badge-primary">-</Badge>
						)}
						{cost > 0 && (
							<Badge className="badge-xxlarge badge-primary">
								{cost + " gold"}
							</Badge>
						)}
					</Col>
				</Row>
			</Container>
		</div>
	);
}
