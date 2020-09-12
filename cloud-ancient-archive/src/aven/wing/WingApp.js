import React from 'react';
import { View, Text, ScrollView } from '@rn';
import { createFullscreenSwitchNavigator } from '@aven/navigation-web';
import { useCloudClient } from '@aven/cloud';
import { useFocus, useNavigation } from '@aven/navigation-hooks';
import { Button, Stack, TextInput, useKeyboardPopover } from '@aven/plane';
import { PopoverContainer } from '@aven/views';
import { Link } from '@aven/navigation-web';
import { createAuthNavigator } from '@aven/auth';
import { createContentPage } from '@aven/content';
import * as Logic from '@aven/logic';

function Home() {
  return (
    <SimplePage>
      <Text>Welcome!</Text>
      <Link routeName="AuthLogin">Log in</Link>
    </SimplePage>
  );
}
Home.navigationOptions = { title: 'Welcome' };

function PageStructure({ children, header, footer, center }) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fafafa',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          backgroundColor: '#fff',
          maxWidth: 800,
          alignSelf: 'stretch',
          flex: 1,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}
      >
        {header}
        <View style={{ flex: 1 }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flex: 1,
              justifyContent: center ? 'center' : 'flex-start',
              alignItems: center ? 'center' : 'stretch',
            }}
          >
            {children}
          </ScrollView>
        </View>

        {footer}
      </View>
    </View>
  );
}

function FooterLink({ label, routeName }) {
  return (
    <View>
      <Link routeName={routeName}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: 'Helvetica',
            paddingHorizontal: 8,
            paddingVertical: 22,
          }}
        >
          {label}
        </Text>
      </Link>
    </View>
  );
}

function SimplePage({ children, center }) {
  return (
    <PageStructure
      header={
        <View style={{ backgroundColor: '#e5e5ef', height: 80 }}>
          <Link routeName="Home">
            <Text>Aven Home</Text>
          </Link>
        </View>
      }
      footer={
        <View
          style={{
            backgroundColor: '#e5e5ef',
            height: 50,
            flexDirection: 'row',
            flexWrap: 'wrap',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontFamily: 'Helvetica',
              paddingHorizontal: 8,
              paddingVertical: 22,
            }}
          >
            &copy; {new Date().getFullYear()} Aven, LLC. All Rights Reserved.
          </Text>
          <View style={{ flex: 1 }} />
          <FooterLink label="Terss asdf sms" routeName="LegalTerms" />
          <FooterLink label="Tera sdfms" routeName="LegalTerms" />
          <FooterLink label="Teasdf rms" routeName="LegalTerms" />
          <FooterLink label="Privacy" routeName="LegalPrivacy" />
        </View>
      }
      center={center}
    >
      {children}
    </PageStructure>
  );
}
const isServer = !!process.env.NODE;

function ItemList() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{}}>
        <Text>Thing</Text>
      </View>
    </ScrollView>
  );
}

function AdminPanel() {
  const cc = Logic.createBlockContext();
  const { onPopover } = useKeyboardPopover(({ onClose }) => <Text>Hiho</Text>);
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', maxWidth: 320 }}
      >
        <ItemList />

        <Button
          title="create"
          onPress={() => {
            onPopover();
          }}
        />
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}

function AdminScreen() {
  if (isServer) {
    return null;
  }
  return <AdminPanel />;
}

const NavApp = createFullscreenSwitchNavigator({
  Home: {
    path: '',
    screen: Home,
  },
  Admin: {
    path: 'admin',
    screen: AdminScreen,
  },
  Auth: {
    path: 'auth',
    screen: createAuthNavigator(SimplePage),
  },
  LegalTerms: {
    path: 'legal/terms',
    screen: createContentPage(SimplePage, 'Content/LegalTerms'),
  },
  LegalPrivacy: {
    path: 'legal/privacy',
    screen: createContentPage(SimplePage, 'Content/LegalPrivacy'),
  },
});

export default function App({ navigation }) {
  return (
    <PopoverContainer>
      <NavApp navigation={navigation} />
    </PopoverContainer>
  );
}
App.router = NavApp.router;
App.navigationOptions = NavApp.navigationOptions;