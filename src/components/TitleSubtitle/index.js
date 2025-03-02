/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import {normalize} from '../../styles/responsive';
import FontText from '../FontText';

const TitleSubtitle = ({Title, SubTitle, pTop, pBottom, fontStyle}) => {
  return (
    <>
      <FontText
        style={fontStyle}
        name={'bold'}
        size={normalize(30)}
        color={'textDark'}
        pTop={pTop}
        pBottom={pBottom}>
        {Title}
      </FontText>
      <FontText size={normalize(15)} color={'gray'}>
        {SubTitle}
      </FontText>
    </>
  );
};



export default TitleSubtitle;
