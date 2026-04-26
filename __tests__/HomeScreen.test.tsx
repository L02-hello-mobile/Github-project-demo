import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('1. Hiển thị đúng tên người dùng', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Hello Mobile')).toBeTruthy();
  });

  it('2. Hiển thị tiến độ 85% trong banner', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('85%')).toBeTruthy();
  });

  it('3. Nút hành động trong banner hoạt động', () => {
    const { getByTestId, getByText } = render(<HomeScreen />);
    const btn = getByTestId('btn-action');
    fireEvent.press(btn);
    expect(getByText('Đang tải...')).toBeTruthy();
  });
});