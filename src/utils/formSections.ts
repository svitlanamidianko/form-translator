// Form grouping helpers - turns the /forms response into nice titled sections
// This is like a small form_sections.py module in Python with pure functions (easy to test)

import { FORM_SECTIONS, LANGUAGE_DISPLAY } from '@/constants';
import type { FormOption, FormSection, FormsResponse } from '@/types';

// "  Gen   Z " -> "gen z" (so we can compare names without caring about case/spaces)
// This is like " ".join(name.split()).casefold() in Python
export function normalizeFormName(name: string): string {
  return String(name ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Convert the API response into a list of FormOption sorted by sheet order + the list of groups
// This is like a Python function that returns (options, groups)
export function formOptionsFromResponse(response: FormsResponse): { options: FormOption[]; groups: string[] } {
  // Older backend versions did not send "groups" and their "category" was really a long description,
  // so only trust categories when the backend says it speaks the new format (it sends a groups list)
  const hasSemanticGroups = Array.isArray(response.groups);
  const reservedKeys = new Set<string>([LANGUAGE_DISPLAY.DETECT_KEY, LANGUAGE_DISPLAY.CUSTOM_KEY]);

  const options: FormOption[] = Object.entries(response.forms || {})
    .filter(([key]) => key.trim() && !reservedKeys.has(normalizeFormName(key)))
    .map(([key, formData], index) => {
      const category = hasSemanticGroups && typeof formData.category === 'string' && formData.category.trim()
        ? formData.category.trim()
        : null;
      return {
        key,
        label: formData.description || key,
        category,
        userSubmitted: formData.userSubmitted === true,
        // Fall back to the response position if "order" is missing
        order: typeof formData.order === 'number' ? formData.order : 100000 + index,
      };
    })
    // Sort by sheet order (jsonify sorts keys alphabetically, so we can't trust object key order)
    .sort((a, b) => a.order - b.order);

  const groups = hasSemanticGroups
    ? (response.groups as string[]).filter((g) => typeof g === 'string' && g.trim()).map((g) => g.trim())
    : [];

  return { options, groups };
}

// Does this form match what the user typed in the search box?
// We search the name, the full label (it includes the ukrainian translation) and the group name
function matchesSearch(form: FormOption, query: string): boolean {
  const q = normalizeFormName(query);
  if (!q) return true;
  return (
    normalizeFormName(form.key).includes(q) ||
    normalizeFormName(form.label).includes(q) ||
    normalizeFormName(form.category ?? '').includes(q)
  );
}

// Build the sections we show in the dropdown, in this order:
//   1. one section per group (in the order the backend sent "groups"), forms in sheet order
//   2. "more forms": curated forms without a group
//   3. "added by visitors": visitor forms without a group
// Empty sections (e.g. after searching) are hidden.
export function buildFormSections(forms: FormOption[], groups: string[], searchQuery = ''): FormSection[] {
  const sorted = [...forms].sort((a, b) => a.order - b.order);

  // Group order: backend order first, then any group we see that the backend forgot to list
  // (a Map keeps insertion order - like an OrderedDict in Python)
  const groupTitles = new Map<string, string>(); // normalized name -> title to show
  groups.forEach((g) => {
    const norm = normalizeFormName(g);
    if (norm && !groupTitles.has(norm)) groupTitles.set(norm, g.trim());
  });
  sorted.forEach((form) => {
    const norm = normalizeFormName(form.category ?? '');
    if (norm && !groupTitles.has(norm)) groupTitles.set(norm, (form.category ?? '').trim());
  });

  const grouped = new Map<string, FormOption[]>();
  groupTitles.forEach((_title, norm) => grouped.set(norm, []));
  const ungroupedCurated: FormOption[] = [];
  const ungroupedVisitor: FormOption[] = [];

  sorted
    .filter((form) => matchesSearch(form, searchQuery))
    .forEach((form) => {
      const norm = normalizeFormName(form.category ?? '');
      const groupList = norm ? grouped.get(norm) : undefined;
      if (groupList) {
        groupList.push(form);
      } else if (form.userSubmitted) {
        ungroupedVisitor.push(form);
      } else {
        ungroupedCurated.push(form);
      }
    });

  const sections: FormSection[] = [];
  groupTitles.forEach((title, norm) => {
    const groupForms = grouped.get(norm) ?? [];
    if (groupForms.length > 0) {
      sections.push({ id: `group:${norm}`, title, forms: groupForms });
    }
  });

  // If there are no groups at all (e.g. old backend), "more forms" would sound odd - call it "all forms"
  const hasAnyGroups = groupTitles.size > 0;
  if (ungroupedCurated.length > 0) {
    sections.push({
      id: 'ungrouped',
      title: hasAnyGroups ? FORM_SECTIONS.UNGROUPED_TITLE : FORM_SECTIONS.ALL_FORMS_TITLE,
      forms: ungroupedCurated,
    });
  }
  if (ungroupedVisitor.length > 0) {
    sections.push({ id: 'visitors', title: FORM_SECTIONS.VISITOR_TITLE, forms: ungroupedVisitor });
  }

  return sections;
}
