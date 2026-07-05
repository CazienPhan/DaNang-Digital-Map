import React from 'react';
import type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps } from './Card.types';

export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Body: React.FC<CardBodyProps>;
  Footer: React.FC<CardFooterProps>;
} = () => {
  return null; // Structural placeholder (no UI implementation)
};

Card.Header = () => null;
Card.Body = () => null;
Card.Footer = () => null;
