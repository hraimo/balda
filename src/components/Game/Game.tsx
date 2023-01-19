import { Actions } from 'components/Game/components/Actions/Actions';
import { Box } from '@mui/material';
import { Cell } from 'types/cell.interface';
import { Coord } from 'helpers/coord';
import {
  FIELD_SIZE,
  LETTERS_SHAKING_DURATION,
  LETTER_ROTATING_DURATION,
} from 'contants';
import { Field } from 'components/Game/components/Field/Field';
import { FinishTurnButton } from 'components/Game/components/FinishTurnButton/FinishTurnButton';
import { InputError } from 'components/Game/enums/input-error.enum';
import { ScoreOrientation } from 'components/Game/components/Statistic/enums/score-orientation.enum';
import { SideSection } from 'components/Game/styled';
import { Statistic } from 'components/Game/components/Statistic/Statistic';
import { StatisticsButton } from 'components/Game/components/Statistic/StatisticsButton';
import { TopScores } from 'components/Game/components/TopScores';
import { WordPreview } from 'components/Game/components/WordPreview/WordPreview';
import { checkIsFieldFilled } from 'components/Game/utils/check-is-field-filled';
import { checkIsWordExist } from 'utils/word/check-is-word-exist';
import { getRandomWord } from 'utils/word/get-random-word';
import { getWordsFromPlayers } from 'components/Game/utils/get-words-from-players';
import { isEmpty, isNull } from 'lodash';
import { isNotNull } from 'utils/null/is-not-null';
import { mapCellsToWord } from 'components/Game/utils/map-cells-to-word';
import { useField } from 'components/Game/hooks/use-field';
import { useInputError } from 'components/Game/hooks/use-input-error';
import { useKeyboard } from 'components/Game/hooks/use-keyboard';
import { usePlayers } from 'components/Game/hooks/use-players';
import { useTimeout } from 'hooks/use-timeout';
import React, { FC, useEffect, useState } from 'react';

interface Props {
  pause?: boolean;
  names: string[];
  openMenu: () => void;
}

export const Game: FC<Props> = ({ pause, names, openMenu }) => {
  const [initialWord, setInitialWord] = useState('');
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [enteredLetterCoord, setEnteredLetterCoord] = useState<Coord | null>(
    null,
  );
  const [highlightedCoords, setHighlightedCoords] = useState<Coord[]>([]);
  const { players, turn, switchTurn, finishTurn } = usePlayers({
    names,
    isPause: pause,
  });
  const { error, setError, resetError } = useInputError();
  const { cells, setFieldCell } = useField(initialWord);
  const { isRunning: isLettersShaking, run: shakeLetters } = useTimeout(
    LETTERS_SHAKING_DURATION,
  );
  const { isRunning: isEnteredLetterRotating, run: rotateLetter } = useTimeout(
    LETTER_ROTATING_DURATION,
  );

  const lastSelected = selectedCells[selectedCells.length - 1];
  const endGame = checkIsFieldFilled(cells) && isNull(enteredLetterCoord);

  const blurActiveCell = () => {
    (document.activeElement as HTMLElement).blur();
  };

  const undo = () => {
    if (
      isNotNull(enteredLetterCoord) &&
      lastSelected?.coord.equals(enteredLetterCoord)
    ) {
      setFieldCell(enteredLetterCoord, '');
      setEnteredLetterCoord(null);
    }

    setSelectedCells((prev) => prev.slice(0, prev.length - 1));
    resetError();
    blurActiveCell();
  };

  const clearSelection = (options?: { keepEntered?: boolean }) => {
    setSelectedCells([]);
    resetError();
    blurActiveCell();

    if (isNull(enteredLetterCoord)) {
      return;
    }
    if (options?.keepEntered) {
      rotateLetter(() => setEnteredLetterCoord(null));
      return;
    }

    setFieldCell(enteredLetterCoord, '');
    setEnteredLetterCoord(null);
  };

  const handleError = (inputError: InputError) => {
    shakeLetters();
    setError(inputError);
  };

  const onCheckWord = () => {
    if (isNull(enteredLetterCoord) || isEmpty(lastSelected?.value)) {
      handleError(InputError.LETTER_NOT_ENTERED);
      return;
    }

    const word = mapCellsToWord(selectedCells);
    const usedWords = getWordsFromPlayers(players).concat(initialWord);

    if (usedWords.includes(word)) {
      handleError(InputError.WORD_HAS_BEEN_ALREADY_ENTERED);
      return;
    }
    if (!checkIsWordExist(word)) {
      handleError(InputError.WORD_DOES_NOT_EXIST);
      return;
    }

    finishTurn({
      letters: word,
      coords: selectedCells.map(({ coord }) => coord),
    });
    clearSelection({ keepEntered: true });
  };

  const skipTurn = () => {
    switchTurn();
    clearSelection();
  };

  useKeyboard({
    checkWord: onCheckWord,
    clearSelection,
    undo,
    isPause: pause,
  });

  useEffect(() => {
    if (pause) {
      return;
    }

    setInitialWord(getRandomWord(FIELD_SIZE));
    setSelectedCells([]);
    setEnteredLetterCoord(null);
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause]);

  return (
    <Box display="flex" justifyContent="center">
      <SideSection stick="right">
        <Statistic
          player={players[0]}
          scoreOrientation={ScoreOrientation.RIGHT}
          active={turn === 0}
          setHighlightedCoords={setHighlightedCoords}
        />
      </SideSection>
      <Box display="flex" flexDirection="column" alignItems="center" pt={1.5}>
        <TopScores players={players} turn={turn} />
        <WordPreview
          enteredLetterCoord={enteredLetterCoord}
          selectedCells={selectedCells}
          error={error}
          lettersShaking={isLettersShaking}
        />
        <Field
          cells={cells}
          setFieldCell={setFieldCell}
          enteredLetterCoord={enteredLetterCoord}
          setEnteredLetterCoord={setEnteredLetterCoord}
          selectedCells={selectedCells}
          setSelectedCells={setSelectedCells}
          resetError={resetError}
          undo={undo}
          enteredLetterRotating={isEnteredLetterRotating}
          highlightedCoords={highlightedCoords}
        />
        <Actions
          onClearSelection={clearSelection}
          onSkipTurn={skipTurn}
          onUndo={undo}
          onCapitulate={openMenu}
        />
        <StatisticsButton players={players} turn={turn} />
        <FinishTurnButton
          onClick={endGame ? openMenu : onCheckWord}
          endGame={endGame}
        />
      </Box>
      <SideSection stick="left">
        <Statistic
          player={players[1]}
          scoreOrientation={ScoreOrientation.LEFT}
          active={turn === 1}
          setHighlightedCoords={setHighlightedCoords}
        />
      </SideSection>
    </Box>
  );
};