import { mapValues } from "lodash";
import { capitalCase, pascalCase } from "change-case";
import type { IconId } from "./gloomhavenIcon";

const effectTypeToIcon: Partial<Record<EffectTypes.Any, IconId>> = {
	pierce: "statusEffectPierce",
	push: "statusEffectPush",
	pull: "statusEffectPull",
	hp: "generalHeal",
	regenerate: "statusEffectRegenerate",
	ward: "statusEffectWard",
	strengthen: "statusEffectStrengthen",
	bless: "statusEffectBless",
	wound: "statusEffectWound",
	poison: "statusEffectPoison",
	immobilize: "statusEffectImmobilize",
	muddle: "statusEffectMuddle",
	curse: "statusEffectCurse",
	specificElement: "elementFire",
	wildElement: "elementAll",
	jump: "generalJump",
};

const effectTypeToTitle: Partial<Record<EffectTypes.Any, string>> = {
	hp: "HP",
};

export interface Effect {
	cost: number;
	title: string;
	icon: IconId;
}

export function buildEffects<TKey extends EffectTypes.Any>(
	rawDefinitions: Record<TKey, number>
): Record<TKey, Effect> {
	return mapValues(
		rawDefinitions,
		(cost, key): Effect => ({
			cost,
			title: effectTypeToTitle[key] ?? capitalCase(key),
			icon: effectTypeToIcon[key] ?? `general${pascalCase(key)}`,
		})
	);
}

export namespace EffectTypes {
	export type PlayerPlusOne =
		| "move"
		| "attack"
		| "range"
		| "target"
		| "shield"
		| "retaliate"
		| "pierce"
		| "heal"
		| "push"
		| "pull"
		| "teleport";

	export type SummonPlusOne = "hp" | "move" | "attack" | "range";
	export type Other =
		| "regenerate"
		| "ward"
		| "strengthen"
		| "bless"
		| "wound"
		| "poison"
		| "immobilize"
		| "muddle"
		| "curse"
		| "specificElement"
		| "wildElement"
		| "jump";

	export type Any = PlayerPlusOne | SummonPlusOne | Other;
}
