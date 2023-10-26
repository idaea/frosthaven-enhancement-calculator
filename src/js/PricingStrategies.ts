import { Effect, EffectTypes, buildEffects } from "./buildEffects";

export type PricingStrategyType =
	| "frosthaven"
	| "frosthaven_non_permanent"
	| "gloomhaven_digital";

export type PricingStrategy = {
	getCostFromCardLevel(cardLevel: number, enhancerLevel: number): number;
	getCostFromPriorEnhancements(
		numberOfPriorEnhancements: number,
		enhancerLevel: number
	): number;
	baseNewAttackHexCost: number;
	effects: {
		playerPlusOne: Record<EffectTypes.PlayerPlusOne, Effect>;
		summonPlusOne: Record<EffectTypes.SummonPlusOne, Effect>;
		other: Record<EffectTypes.Other, Effect>;
	};
};

const frosthaven: PricingStrategy = {
	getCostFromCardLevel(cardLevel, enhancerLevel) {
		return (cardLevel - 1) * (enhancerLevel >= 3 ? 15 : 25);
	},
	getCostFromPriorEnhancements(numberOfPriorEnhancements, enhancerLevel) {
		return numberOfPriorEnhancements * (75 - (enhancerLevel === 4 ? 25 : 0));
	},
	baseNewAttackHexCost: 200,
	effects: {
		playerPlusOne: buildEffects({
			move: 30,
			attack: 50,
			range: 30,
			target: 75,
			shield: 80,
			retaliate: 60,
			pierce: 30,
			heal: 30,
			push: 30,
			pull: 20,
			teleport: 50,
		}),

		summonPlusOne: buildEffects({
			hp: 40,
			move: 60,
			attack: 100,
			range: 50,
		}),

		other: buildEffects({
			regenerate: 40,
			ward: 75,
			strengthen: 100,
			bless: 75,
			wound: 75,
			poison: 50,
			immobilize: 150,
			muddle: 40,
			curse: 150,
			specificElement: 100,
			wildElement: 150,
			jump: 60,
		}),
	},
};

const frosthaven_non_permanent: PricingStrategy = {
	...frosthaven,
	getCostFromPriorEnhancements(numberOfPriorEnhancements, enhancerLevel) {
		const vanillaCost = frosthaven.getCostFromPriorEnhancements(
			numberOfPriorEnhancements,
			enhancerLevel
		);

		return Math.max(0, vanillaCost - 20);
	},
};

const gloomhaven_digital: PricingStrategy = {
	getCostFromCardLevel(cardLevel) {
		return (cardLevel - 1) * 10;
	},
	getCostFromPriorEnhancements(numberOfPriorEnhancements, enhancerLevel) {
		return numberOfPriorEnhancements * 20;
	},
	baseNewAttackHexCost: 150,
	effects: {
		// values from https://i.imgur.com/nEsIUvG.png
		// recommended by FH dev here: https://www.reddit.com/r/Gloomhaven/comments/uo3som/comment/i8cej68/
		playerPlusOne: buildEffects({
			move: 20,
			attack: 35,
			range: 20,
			target: 40,
			shield: 60,
			retaliate: 40,
			pierce: 15,
			heal: 20,
			push: 20,
			pull: 15,
			teleport: 50,
		}),

		summonPlusOne: buildEffects({
			hp: 30,
			move: 40,
			attack: 60,
			range: 40,
		}),

		other: buildEffects({
			regenerate: 40,
			ward: 40,
			strengthen: 100,
			bless: 50,
			wound: 45,
			poison: 30,
			immobilize: 100,
			muddle: 25,
			curse: 100,
			specificElement: 60,
			wildElement: 90,
			jump: 35,
		}),
	},
};

export const PricingStrategies = {
	frosthaven,
	frosthaven_non_permanent,
	gloomhaven_digital,
} satisfies Record<PricingStrategyType, PricingStrategy>;
