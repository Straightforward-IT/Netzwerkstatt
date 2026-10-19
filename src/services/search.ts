import type { Category, Person } from '../types/network';

/** Accent tolerant, including German ae/oe/ue spellings and ß. */
export function normalizeSearch(value: string): string {
  return value.toLowerCase().replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function searchPeople(
  people: Person[],
  categories: Category[],
  query: string,
  categoryId: string | null,
  favoritesOnly: boolean,
): Person[] {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const tokens = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
  const phoneQuery = query.replace(/[^\d]/g, '');
  const isPhoneQuery = phoneQuery.length > 0 && /^[+\d\s()./-]+$/.test(query.trim());

  return people.filter((person) => {
    if (person.isSelf) return false;
    if (categoryId && !person.categoryIds.includes(categoryId)) return false;
    if (favoritesOnly && !person.favorite) return false;
    if (tokens.length === 0) return true;
    const searchable = normalizeSearch([
      person.firstName, person.lastName, person.nickname, person.company, person.city, person.notes,
      ...person.categoryIds.map((id) => categoryNames.get(id) ?? id),
      ...person.tags, ...person.skills,
      ...person.contactMethods.flatMap((method) => [method.value, method.label]),
    ].filter(Boolean).join(' '));
    if (tokens.every((token) => searchable.includes(token))) return true;
    return isPhoneQuery && person.contactMethods.some((method) => method.type === 'phone' && method.value.replace(/[^\d]/g, '').includes(phoneQuery));
  });
}
