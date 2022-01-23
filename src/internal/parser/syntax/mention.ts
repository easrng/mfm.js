import { MENTION } from '../../../node';
import { MatcherContext } from '../services/matcher';
import { isAllowedAsBackChar } from '../services/matchingUtil';
import { CharCode } from '../services/string';

function hostMatcher(ctx: MatcherContext) {
	// "@"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.at) {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	const matched = /^[a-z0-9_.-]+/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	let name = matched[0];
	// (name) first character must not be "-" or "."
	const firstCode = name.charCodeAt(0);
	if (firstCode == CharCode.minus || firstCode == CharCode.dot) {
		return ctx.fail();
	}
	// (name) last character must not be "-" or "."
	let length = name.length;
	while (length > 0) {
		const lastCode = name.charCodeAt(length - 1);
		if (lastCode != CharCode.minus && lastCode != CharCode.dot) {
			break;
		}
		length--;
	}
	if (length == 0) {
		return ctx.fail();
	}
	if (length != name.length) {
		name = name.substr(0, length);
	}

	return ctx.ok(name);
}

export function mentionMatcher(ctx: MatcherContext) {
	let matched;
	const headPos = ctx.pos;

	// check a back char
	if (!isAllowedAsBackChar(ctx)) {
		return ctx.fail();
	}

	// "@"
	if (ctx.input.charCodeAt(ctx.pos) != CharCode.at) {
		return ctx.fail();
	}
	ctx.pos++;

	// name
	matched = /^[a-z0-9_-]+/.exec(ctx.input.substr(ctx.pos));
	if (matched == null) {
		return ctx.fail();
	}
	let name = matched[0];
	// (name) first character must not be "-"
	if (name.charCodeAt(0) == CharCode.minus) {
		return ctx.fail();
	}
	// (name) last character must not be "-"
	let length = name.length;
	while (length > 0 && name.charCodeAt(length - 1) == CharCode.minus) {
		length--;
	}
	if (length == 0) {
		return ctx.fail();
	}
	if (length != name.length) {
		name = name.substr(0, length);
	}

	// host
	matched = ctx.tryConsume(hostMatcher);
	const host = matched.ok ? matched.result : null;

	const acct = ctx.input.substring(headPos, ctx.pos);

	return ctx.ok(MENTION(name, host, acct));
}