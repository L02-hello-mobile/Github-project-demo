import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OnboardingScreen from '../screens/OnboardingScreen';

describe('OnboardingScreen (Login)', () => {
  it('1. Hiển thị đúng tiêu đề chào mừng', () => {
    const { getByText } = render(<OnboardingScreen />);
    expect(getByText('Chào mừng trở lại')).toBeTruthy();
  });

  it('2. Nhập Email và Password thành công', () => {
    const { getByTestId } = render(<OnboardingScreen />);
    const emailInput = getByTestId('input-email');
    const passInput = getByTestId('input-password');

    fireEvent.changeText(emailInput, 'admin@eventflow.com');
    fireEvent.changeText(passInput, '123456');

    expect(emailInput.props.value).toBe('admin@eventflow.com');
    expect(passInput.props.value).toBe('123456');
  });

  it('3. Nhấn Đăng nhập chuyển hướng sang Home', () => {
    const mockNav = { navigate: jest.fn() };
    const { getByTestId } = render(<OnboardingScreen navigation={mockNav} />);
    fireEvent.press(getByTestId('btn-login'));
    expect(mockNav.navigate).toHaveBeenCalledWith('Home');
  });
});