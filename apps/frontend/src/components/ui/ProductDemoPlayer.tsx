import { AnimatedVideoModal } from './AnimatedVideoModal';

export interface ProductDemoPlayerProps {
  open: boolean;
  initialChapter?: number;
  mode?: 'single' | 'full';
  onClose: () => void;
}

export const ProductDemoPlayer = ({ open, onClose }: ProductDemoPlayerProps) => {
  return <AnimatedVideoModal open={open} onClose={onClose} />;
};
