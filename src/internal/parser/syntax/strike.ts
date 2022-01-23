import { MfmInline, STRIKE } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { pushNode } from '../services/nodeTree';
import { inlineSyntaxMatcher } from '../services/syntaxMatcher';
import { LfMatcher } from '../services/utilMatchers';

export function strikeTagMatcher(ctx: MatcherContext) {
	let matched;

	// "<s>"
	if (!ctx.input.startsWith('<s>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 3;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('</s>', ctx.pos)) {
			break;
		}

		if (LfMatcher(ctx).ok) {
			break;
		}

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "</s>"
	if (!ctx.input.startsWith('</s>', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 4;

	return ctx.ok(STRIKE(children));
}

export function strikeTildeMatcher(ctx: MatcherContext) {
	let matched;

	// "~~"
	if (!ctx.input.startsWith('~~', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	// children
	const children: MfmInline[] = [];
	while (true) {
		if (ctx.input.startsWith('~', ctx.pos)) {
			break;
		}

		if (LfMatcher(ctx).ok) {
			break;
		}

		matched = ctx.consume(inlineSyntaxMatcher);
		if (!matched.ok) {
			return ctx.fail();
		}
		pushNode(matched.result, children);
	}
	if (children.length < 1) {
		return ctx.fail();
	}

	// "~~"
	if (!ctx.input.startsWith('~~', ctx.pos)) {
		return ctx.fail();
	}
	ctx.pos += 2;

	return ctx.ok(STRIKE(children));
}