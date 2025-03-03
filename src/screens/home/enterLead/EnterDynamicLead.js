/* eslint-disable react-hooks/exhaustive-deps */
import DrawerHeader from 'components/header/DrawerHeader';
import React from 'react';
import DynamicForm from './DynamicForm';
import FontText from 'components/FontText';
import {normalize} from 'helpers/styles/responsive';
import colors from 'assets/colors';
import Fonts from 'assets/fonts/fonts';
import {Pressable} from 'react-native';
import { Utils } from 'helpers/utils';
import { isTablet } from 'react-native-device-info';

export default function EnterDynamicLead({openDrawer}) {
  return (
    <>
      <DrawerHeader
        hasLeft
        openDrawer={openDrawer}
        title={'Enter Lead'}
        hasRight
        right={
          <Pressable onPress={()=>{
            Utils.userLogout();
          }} >
            <FontText
              fontFamily={Fonts.bold}
              textAlign="center"
              color={colors.blue_0165fc}
              size={isTablet() ? normalize(15) : normalize(13)}>
              {'Switch Account'}
            </FontText>
          </Pressable>
        }
      />
      <DynamicForm />
    </>
  );
}
