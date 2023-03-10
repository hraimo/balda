import { ALPHABET } from 'components/Game/components/Field/constants';
import { Cell } from 'types/cell.interface';
import { Coord } from 'helpers/coord';
import { Word } from 'types/word.interface';
import { difference, groupBy, sample } from 'lodash';
import { getNouns } from 'data/lazy';
import { isNotEmpty } from 'utils/null/is-not-empty';
import { isNotNull } from 'utils/null/is-not-null';

class TemplateBuilder {
  constructor(
    private readonly field: Cell[][],
    private readonly dictionary: string[],
  ) {}

  private checkAreExistSimilarWords(template: string): boolean {
    const slices = template.toLowerCase().split('*');

    if (slices.length === 2 && slices.every((slice) => slice.length > 0)) {
      return this.dictionary.some(
        (word) => word.startsWith(slices[0]) && word.endsWith(slices[1]),
      );
    }
    if (slices.length === 1 || slices[1].length === 0) {
      return this.dictionary.some((noun) => noun.startsWith(slices[0]));
    }

    return this.dictionary.some((noun) => noun.endsWith(slices[1]));
  }

  /**
   * @example
   * getTemplatesForCoord(field);
   * // {
   * //   { letters: 'п*', coords: [{ x: 0, y: 0 }, { x: 0, y: 1 }]},
   * // }
   * @returns Return words with one empty letter marked as `*`
   */
  private getTemplatesForCoord(
    coord: Coord,
    templates: Word[] = [],
    template: Word = { letters: '', coords: [] },
  ): Word[] {
    const cell = this.field[coord.y][coord.x];

    if (!cell.value && template.letters.includes('*')) {
      return templates;
    }

    const newTemplate: Word = {
      letters: template.letters.concat(cell.value || '*'),
      coords: template.coords.concat(cell.coord),
    };
    const isCorrectTemplateStructure =
      newTemplate.letters.length > 1 && newTemplate.letters.includes('*');
    const templatesWithNewTemplate = isCorrectTemplateStructure
      ? templates.concat(newTemplate)
      : templates;

    if (!this.checkAreExistSimilarWords(newTemplate.letters)) {
      return templates;
    }

    const directions = Object.values(cell.directions) as (Coord | null)[];

    return directions
      .filter(isNotNull)
      .filter(
        (direction) =>
          !newTemplate.coords.some((letterCoord) =>
            letterCoord.equals(direction),
          ),
      )
      .reduce(
        (newTemplates, direction) =>
          this.getTemplatesForCoord(direction, newTemplates, newTemplate),
        templatesWithNewTemplate,
      );
  }

  getTemplates(): Word[] {
    return this.field
      .flatMap((row) => row)
      .map(({ coord }) => this.getTemplatesForCoord(coord))
      .flatMap((word) => word);
  }
}

function mapTemplateToRegExp(template: string): RegExp {
  const slices = template.split('*');
  return new RegExp(
    `^${slices[0] ?? ''}[${ALPHABET}]${slices[1] ?? ''}$`.toLowerCase(),
  );
}

/**
 * @returns Available words for field. If there are different possible words for
 * single position, returns random one. If there are different positions available
 * for single word, gives random position
 */
export function getAvailableWords(
  field: Cell[][],
  excludedWords: string[] = [],
): Word[] {
  const nouns = getNouns();
  const templates = new TemplateBuilder(field, nouns).getTemplates();
  const templatesGroups = groupBy(templates, ({ letters }) => letters);
  const vocabulary = difference(nouns, excludedWords);

  return Object.keys(templatesGroups)
    .map((template) => {
      const regExp = mapTemplateToRegExp(template);

      return {
        letters: sample(vocabulary.filter((noun) => regExp.test(noun))) ?? '',
        coords: sample(templatesGroups[template])?.coords ?? [],
      };
    })
    .filter(({ letters }) => isNotEmpty(letters));
}
