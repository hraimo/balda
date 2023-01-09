import { Box, Divider, FormHelperText, Zoom } from '@mui/material';
import { Cell } from 'types/cell.interface';
import { Coord } from 'helpers/coord';
import { Letter, LetterContainer } from 'components/WordPreview/styled';
import { getCellKey } from 'utils/get-cell-key';
import { isNull } from 'lodash';
import React, { FC } from 'react';

interface Props {
  error?: boolean;
  errorMessage?: string;
  enteredLetterCoord: Coord | null;
  selectedCells: Cell[];
  lettersShaking?: boolean;
}

export const WordPreview: FC<Props> = ({
  error,
  errorMessage,
  enteredLetterCoord,
  selectedCells,
  lettersShaking,
}) => {
  return (
    <div>
      <Box display="flex">
        {(isNull(enteredLetterCoord)
          ? [
              ...selectedCells,
              { value: '\u2000', coord: new Coord({ x: 0, y: 0 }) },
            ]
          : selectedCells
        ).map((cell, i, arr) => (
          <LetterContainer
            key={getCellKey(cell)}
            lettersShaking={lettersShaking}
            small={arr.length > 6}
          >
            <Zoom in>
              <Letter
                entered={enteredLetterCoord?.equals(cell.coord)}
                small={arr.length > 6}
              >
                {cell.value || '\u2000'}
              </Letter>
            </Zoom>
            <Divider
              sx={{
                width: 1,
                boxSizing: 'border-box',
                height: 4,
              }}
            />
          </LetterContainer>
        ))}
      </Box>
      <FormHelperText
        component="div"
        sx={{
          lineHeight: 1,
          height: 12,
        }}
        error
      >
        <Zoom in={error}>
          <div>{errorMessage}</div>
        </Zoom>
      </FormHelperText>
    </div>
  );
};
