import { ReactElement, ReactNode, useState } from "react";
import { Container, Row, Col, Button, Badge, Form } from "react-bootstrap";
import GloomhavenIcon from "./gloomhavenIcon";
import { PricingStrategies, PricingStrategyType } from "./PricingStrategies";
import { EffectTypes } from "./buildEffects";

const iconWidth = "16px";

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
	const [pricingStrategyType, setPricingStrategyType] =
		useState<PricingStrategyType>("frosthaven");
	const [enhancerLevel, setEnhancerLevel] = useState<number>(1);

	const pricingStrategy = PricingStrategies[pricingStrategyType];

	function doubleMultipleTargets() {
		if (selectedStickerType === "attackHex") {
			return false;
		}

		if (baseOtherEffect === "specificElement") {
			return false;
		}

		if (baseOtherEffect === "wildElement") {
			return false;
		}

		if (selectedPlayerPlusOneEffect === "target") {
			return false;
		}

		return true;
	}

	function calculateCost() {
		let cost = 0;

		if (selectedStickerType === "playerPlus1") {
			if (selectedPlayerPlusOneEffect) {
				cost +=
					pricingStrategy.effects.playerPlusOne[
						selectedPlayerPlusOneEffect as EffectTypes.PlayerPlusOne
					].cost;
			} else {
				// cannot yet calculate
				return 0;
			}
		} else if (selectedStickerType === "summonPlus1") {
			if (summonPlusOneAbility) {
				cost +=
					pricingStrategy.effects.summonPlusOne[
						summonPlusOneAbility as EffectTypes.SummonPlusOne
					].cost;
			} else {
				// cannot yet calculate
				return 0;
			}
		} else if (selectedStickerType === "attackHex") {
			cost += Math.ceil(
				pricingStrategy.baseNewAttackHexCost /
					numberOfCurrentlyTargetedHexes
			);
		} else if (selectedStickerType === "otherEffect") {
			if (baseOtherEffect) {
				cost +=
					pricingStrategy.effects.other[
						baseOtherEffect as EffectTypes.Other
					].cost;
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
		cost += pricingStrategy.getCostFromCardLevel(
			levelOfAbilityCard,
			enhancerLevel
		);

		// extra cost for previous enhancements to the same action
		cost += pricingStrategy.getCostFromPriorEnhancements(
			numberOfPreviousEnhancements,
			enhancerLevel
		);

		if (pricingStrategyType === "frosthaven_non_permanent") {
			cost = Math.ceil(cost * 0.8);
		}

		if (enhancerLevel >= 2) {
			cost -= 10;
		}

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
					({Math.ceil(200 / i)}g)
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
					{i} (+
					{pricingStrategy.getCostFromPriorEnhancements(i, enhancerLevel)}
					g)
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
					{i} (+
					{pricingStrategy.getCostFromCardLevel(i, enhancerLevel)}
					g)
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

	for (const [baseOtherEffectKey, effect] of Object.entries(
		pricingStrategy.effects.other
	)) {
		let xs = 6;
		let md = 3;
		if (
			baseOtherEffectKey === "specificElement" ||
			baseOtherEffectKey === "wildElement" ||
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
						baseOtherEffectKey === baseOtherEffect ? "active" : undefined
					}
				>
					{effect.title} {icons} ({effect.cost}g)
				</Button>
			</Col>
		);
	}

	for (const [playerPlusOneAbilityLine, ability] of Object.entries(
		pricingStrategy.effects.playerPlusOne
	)) {
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
					{ability.cost}g)
				</Button>
			</Col>
		);
	}

	for (const [summonPlusOneAbilityLine, ability] of Object.entries(
		pricingStrategy.effects.summonPlusOne
	)) {
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
					{ability.cost}g)
				</Button>
			</Col>
		);
	}

	return (
		<div className="container">
			<Container fluid className="enhancement-container">
				<h1 className="mt-2">
					Frosthaven Enhancement Calculator{" "}
					<sup>
						<a href="https://github.com/idaea/frosthaven-enhancement-calculator">
							source
						</a>
					</sup>
				</h1>
				<Row className="hidden-xs">
					<Col xs={12} md={12}>
						<Form>
							<Form.Group as={Form.Row}>
								<Form.Label column sm="2">
									Pricing method
								</Form.Label>
								<Col sm="10">
									<Form.Control
										as="select"
										value={pricingStrategyType}
										onChange={(x) => {
											setPricingStrategyType(
												x.target.value as PricingStrategyType
											);
										}}
									>
										<option value="frosthaven">Frosthaven</option>
										<option value="frosthaven_non_permanent">
											Frosthaven (non-permanent stickers){" "}
										</option>
										{/* <option value="gloomhaven_digital">
										Gloomhaven Digital (non-permanent stickers)
									</option> */}
									</Form.Control>
								</Col>
							</Form.Group>

							<Form.Row as={Form.Row}>
								<Form.Label column sm="2">
									Enhancer level
								</Form.Label>
								<Col sm="10">
									<Form.Control
										as="select"
										value={enhancerLevel}
										onChange={(x) => {
											setEnhancerLevel(parseInt(x.target.value));
										}}
									>
										<option>1</option>
										<option>2</option>
										<option>3</option>
										<option>4</option>
									</Form.Control>
								</Col>
							</Form.Row>
						</Form>

						<p className="mt-4">
							Some enhancements do not fall neatly into the categories on
							the cost chart. When determining their base cost, treat
							damage traps as "
							<GloomhavenIcon icon="generalAttack" width="12px" /> +1"
							enhancements (
							{pricingStrategy.effects.playerPlusOne.attack.cost} gold),
							treat healing traps as "
							<GloomhavenIcon
								alt="Heal Icon"
								icon="generalHeal"
								width="12px"
							/>{" "}
							+1" enhancements (
							{pricingStrategy.effects.playerPlusOne.heal.cost} gold),
							and treat the movement of tokens and tiles as "
							<GloomhavenIcon
								alt="Move Icon"
								icon="generalMove"
								width="12px"
							/>{" "}
							+1" enhancements (
							{pricingStrategy.effects.playerPlusOne.move.cost} gold).
						</p>
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
								<GloomhavenIcon icon="generalLost" width={iconWidth} />{" "}
								Icon, but no Persistent{" "}
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
