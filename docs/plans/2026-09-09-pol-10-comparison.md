# POL-10: question comparison

Reuse the POL-8 public snapshot and POL-9 static routes. Render all active people
in French alphabetical order (stable ID breaks ties), including missing coverage.
Only directly attributed or documented spokesperson measures/objectives belong
in personal answers. Other statements remain separately labelled context.

Add reusable summary, evidence and proposition-detail components. Preserve
conditions, unknown facts, exact source revisions and available proposition
history. Never calculate scores or infer equivalence between quantities.

Add progressive browser filtering with theme/question choices from current
collections and candidate IDs in the URL. Static content remains readable without
JavaScript. No network calls, storage, framework or new dependency is needed.

Implementation and verification sequence:

1. Test the comparison model, attribution boundary, stable order and URL selection.
2. Implement generic comparison and detail routes/components and accessible filters.
3. Extend fictional test data for similar, conditional, missing and revised statements.
4. Test a data-only candidate/fourth-theme extension and removal from current scope,
   retaining only explicitly supplied public historical references.
5. Run contract, Astro, built-link and desktop/mobile browser checks; inspect an
   independent code review, then commit, push and open a PR without merging.

The existing workflow authorizes routine reversible design decisions. No actual
editorial approval, private source publication or production deployment is implied.
