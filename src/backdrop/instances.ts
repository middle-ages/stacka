import { eq as EQ, show as SH } from 'fp-ts';
import { grid } from 'src/grid';
import { Backdrop } from './types';

export const show: SH.Show<Backdrop> = {
  show: ({ image, project }) =>
    `project:${project} using ${grid.show.show(image)}`,
};

export const eq: EQ.Eq<Backdrop> = {
  equals: (
    { image: fstImage, project: fstProject },
    { image: sndImage, project: sndProject },
  ) => fstProject === sndProject && grid.eq.equals(fstImage, sndImage),
};
