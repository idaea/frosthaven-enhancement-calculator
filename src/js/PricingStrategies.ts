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
};

const frosthaven: PricingStrategy = {
	getCostFromCardLevel(cardLevel, enhancerLevel) {
		return (cardLevel - 1) * (enhancerLevel >= 3 ? 15 : 25);
	},
	getCostFromPriorEnhancements(numberOfPriorEnhancements, enhancerLevel) {
		return numberOfPriorEnhancements * (75 - (enhancerLevel === 4 ? 25 : 0));
	},
	baseNewAttackHexCost: 200,
};

const frosthaven_non_permanent: PricingStrategy = {
	...frosthaven,
	getCostFromPriorEnhancements(numberOfPriorEnhancements, enhancerLevel) {
		if (numberOfPriorEnhancements === 0) {
			return 0;
		} else {
			return (
				55 +
				(numberOfPriorEnhancements - 1) *
					(75 - (enhancerLevel === 4 ? 25 : 0))
			);
		}
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
};

export const PricingStrategies = {
	frosthaven,
	frosthaven_non_permanent,
	gloomhaven_digital,
} satisfies Record<PricingStrategyType, PricingStrategy>;
