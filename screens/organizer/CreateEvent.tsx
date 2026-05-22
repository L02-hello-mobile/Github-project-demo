import React, { useMemo, useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Pressable,
	Image,
	ImageBackground,
	Dimensions,
	Platform,
	Alert,
} from "react-native";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const widthScale = screenWidth / 430;
const heightScale = screenHeight / 932;
const vw = (value: number) => value * widthScale;
const sp = (value: number) => value * Math.min(widthScale, heightScale);
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
declare const require: any;

const bgSplash = require("../assets/bgSplash.png");
const arrowLeft = require("../assets/Arrow-Left.png");
const trashIcon = require("../assets/trash-outline.png");

type Step = 1 | 2 | 3;

type Member = {
	id: number;
	email: string;
	role: "Trưởng ban" | "Phó trưởng ban" | "Thành viên";
};

const STEP_COUNT = 3;

const MEMBER_ROLES: Member["role"][] = [
	"Trưởng ban",
	"Phó trưởng ban",
	"Thành viên",
];

const MEMBERS: Member[] = [
	{ id: 1, email: "member1@example.com", role: "Trưởng ban" },
	{ id: 2, email: "member2@example.com", role: "Phó trưởng ban" },
	{ id: 3, email: "member3@example.com", role: "Thành viên" },
	{ id: 4, email: "member4@example.com", role: "Thành viên" },
	{ id: 5, email: "member5@example.com", role: "Thành viên" },
];

const SUGGESTED_MEMBERS = [
	"invite1@example.com",
	"invite2@example.com",
	"invite3@example.com",
	"invite4@example.com",
	"invite5@example.com",
	"invite6@example.com",
	"invite7@example.com",
	"invite8@example.com",
	"invite9@example.com",
	"invite10@example.com",
];

function Stepper({ currentStep }: { currentStep: Step }) {
	return (
		    <View style={styles.stepperWrap}>
			    <View style={styles.stepRow}>
				{[1, 2, 3].map((step) => {
					const active = step <= currentStep;
					return (
						<View key={step} style={styles.stepBubbleWrap}>
							<View style={[styles.stepBubble, active && styles.stepBubbleActive]}>
								<Text style={[styles.stepBubbleText, active && styles.stepBubbleTextActive]}>
									{step}
								</Text>
							</View>
						</View>
					);
				})}
			</View>
		</View>
	);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<View style={styles.card}>
			{title ? <Text style={styles.cardTitle}>{title}</Text> : null}
			{title ? <View style={styles.cardDivider} /> : null}
			{children}
		</View>
	);
}

function UploadBox({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<View style={styles.uploadBox}>
			<View style={styles.uploadInner}>
				{icon}
				<Text style={styles.uploadLabel}>{label}</Text>
			</View>
		</View>
	);
}

export default function CreateEvent({ navigation }: any) {
	const [step, setStep] = useState<Step>(1);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [members, setMembers] = useState<Member[]>(MEMBERS);
	const [showMemberSearch, setShowMemberSearch] = useState(false);
	const [memberSearch, setMemberSearch] = useState("");
	const [activeRoleMenuId, setActiveRoleMenuId] = useState<number | null>(null);
	const [roleMenuPosition, setRoleMenuPosition] = useState<null | { x: number; y: number; width: number; height: number }>(null);
	const pillRefs = useRef<Record<number, any>>({});
	const scrollRef = useRef<ScrollView | null>(null);
	const [eventName, setEventName] = useState("");
	const [description, setDescription] = useState("");

	const filteredSuggestions = useMemo(() => {
		const query = memberSearch.trim().toLowerCase();
		if (!query) {
			return SUGGESTED_MEMBERS;
		}
		return SUGGESTED_MEMBERS.filter((email) => email.toLowerCase().includes(query));
	}, [memberSearch]);

	const filteredMembers = useMemo(() => {
		const query = memberSearch.trim().toLowerCase();
		if (!query) {
			return members;
		}
		return members.filter((member) => member.email.toLowerCase().includes(query));
	}, [memberSearch, members]);

	const formatDateInput = (text: string) => {
		const digits = text.replace(/\D/g, "");
		const d = digits.slice(0, 2);
		const m = digits.slice(2, 4);
		const y = digits.slice(4, 8);
		let out = d;
		if (m.length) out += '/' + m;
		if (y.length) out += '/' + y;
		return out;
	};

	const goNext = () => setStep((current) => Math.min(STEP_COUNT, current + 1) as Step);

	const goBack = () => {
		if (step === 1) {
			navigation?.goBack?.();
			return;
		}

		setStep((current) => Math.max(1, current - 1) as Step);
	};

	const handlePrimaryAction = () => {
		if (step < STEP_COUNT) {
			goNext();
			return;
		}

		navigation?.navigate?.("Main", { screen: "Home" });
	};

	const confirmDelete = (id: number) => {
		console.log('confirmDelete invoked', id, Platform.OS);
		if (Platform.OS === 'web') {
			const ok = window.confirm('Xóa thành viên\nBạn có chắc muốn xóa thành viên này?');
			if (ok) setMembers((cur) => cur.filter((m) => m.id !== id));
			return;
		}

		Alert.alert("Xóa thành viên", "Bạn có chắc muốn xóa thành viên này?", [
			{ text: "Hủy", style: "cancel" },
			{ text: "Xóa", style: "destructive", onPress: () => setMembers((cur) => cur.filter((m) => m.id !== id)) },
		]);
	};

	useEffect(() => {
		if (scrollRef.current && scrollRef.current.scrollTo) {
			scrollRef.current.scrollTo({ y: 0, animated: true });
		}
	}, [step]);

	const renderStepOne = () => (
		<>
			<SectionCard title="Tên sự kiện">
				<TextInput
					placeholder="Tên sự kiện"
					placeholderTextColor={stylesTokens.placeholder}
					value={eventName}
					onChangeText={setEventName}
					style={styles.input}
				/>
			</SectionCard>

			<SectionCard title="Ngày tổ chức">
				<TextInput
					placeholder="Ngày bắt đầu"
					placeholderTextColor={stylesTokens.placeholder}
					value={startDate}
					onChangeText={(v) => setStartDate(formatDateInput(v))}
					style={styles.input}
				/>
				<View style={styles.rowDivider} />
				<TextInput
					placeholder="Ngày kết thúc"
					placeholderTextColor={stylesTokens.placeholder}
					value={endDate}
					onChangeText={(v) => setEndDate(formatDateInput(v))}
					style={styles.input}
				/>
			</SectionCard>

			<SectionCard title="Mô tả">
				<TextInput
					placeholder="Mô tả"
					placeholderTextColor={stylesTokens.placeholder}
					value={description}
					onChangeText={setDescription}
					style={[styles.input, styles.descriptionInput]}
					multiline
					numberOfLines={5}
				/>
			</SectionCard>
		</>
	);

	const renderStepTwo = () => (
		<>
			<SectionCard title="Logo">
				<UploadBox
					icon={<Feather name="image" size={54} color={stylesTokens.softPrimary} />}
					label="Tải ảnh"
				/>
			</SectionCard>

			<SectionCard title="Bản đồ">
				<UploadBox
					icon={<MaterialCommunityIcons name="map-outline" size={54} color={stylesTokens.softPrimary} />}
					label="Tải ảnh"
				/>
			</SectionCard>
		</>
	);

	const renderStepThree = () => (
		<>
			<SectionCard title="Mời thành viên">
				{/* Search */}
				<View style={styles.memberSearchArea}>
					<View style={styles.searchField}>
						<Pressable style={styles.searchInputWrap} onPress={() => setShowMemberSearch(true)}>
							<TextInput
								placeholder="Nhập email để mời"
								placeholderTextColor={stylesTokens.softPrimary}
								value={memberSearch}
								onChangeText={(text: string) => {
									setMemberSearch(text);
									setShowMemberSearch(true);
								}}
								onFocus={() => setShowMemberSearch(true)}
								style={styles.searchInput}
							/>
							<Ionicons name="search" size={26} color={stylesTokens.softPrimary} />
						</Pressable>
					</View>

					{showMemberSearch ? (
						<>
							<Pressable style={styles.memberSearchDismiss} onPress={() => setShowMemberSearch(false)} />
							<View style={styles.memberSearchDropdown}>
								<ScrollView
									style={styles.memberSearchScroll}
									showsVerticalScrollIndicator={true}
									nestedScrollEnabled={true}
									keyboardShouldPersistTaps="handled"
									contentContainerStyle={styles.memberSearchList}
								>
									{filteredSuggestions.map((email) => (
										<View key={email} style={styles.memberSearchRow}>
											<Text style={styles.memberSearchName}>{email}</Text>
											<TouchableOpacity
												style={styles.addButton}
												onPress={() => {
													const nextId = Math.max(0, ...members.map((m) => m.id)) + 1;
													setMembers((cur) => [...cur, { id: nextId, email, role: "Thành viên" }]);
													setShowMemberSearch(false);
													setMemberSearch("");
												}}
											>
												<Text style={styles.addButtonText}>+Mời</Text>
											</TouchableOpacity>
										</View>
									))}
								</ScrollView>
							</View>
						</>
					) : null}
				</View>

				{/* Members */}
				<View style={styles.memberList}>
					{filteredMembers.map((member) => {
						const isActive = activeRoleMenuId === member.id;
						return (
							<View key={member.id} style={styles.memberRow}>
								<Text style={styles.memberName} numberOfLines={1} ellipsizeMode="tail">
									{member.email}
								</Text>
								<View style={styles.memberActionsRow}>
									<View
										ref={(ref) => { pillRefs.current[member.id] = ref; }}
										style={styles.rolePillWrap}
									>
										<TouchableOpacity
											style={[styles.rolePill, isActive && styles.rolePillActive]}
											onPress={() => {
											const ref = pillRefs.current[member.id];
											if (ref && ref.measureInWindow) {
												ref.measureInWindow((x: number, y: number, width: number, height: number) => {
													setRoleMenuPosition({ x, y, width, height });
													setActiveRoleMenuId((current) => (current === member.id ? null : member.id));
												});
											} else {
												setActiveRoleMenuId((current) => (current === member.id ? null : member.id));
											}
										}}
										>
											<Text style={[styles.rolePillText, isActive && styles.rolePillTextActive]} numberOfLines={1} ellipsizeMode="tail">
												{member.role}
											</Text>
											<View style={[styles.caret, isActive && styles.caretUp]} />
										</TouchableOpacity>
									</View>
									<TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(member.id)}>
										<Image source={trashIcon} style={styles.deleteIcon} tintColor="#E24B4B" />
									</TouchableOpacity>
								</View>
							</View>
						);
					})}
				</View>
			</SectionCard>
		</>
	);
	
	return (
		<ImageBackground
			source={bgSplash}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.page}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
						<Image
							source={arrowLeft}
							style={styles.backIcon}
							tintColor={stylesTokens.darkText}
						/>
					</TouchableOpacity>
					<Text style={styles.title}>SỰ KIỆN MỚI</Text>
					<View style={styles.headerSpacer} />
				</View>

				<Stepper key={step} currentStep={step} />

				<ScrollView
					ref={(r) => { scrollRef.current = r; }}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					scrollEnabled={!showMemberSearch}
					keyboardShouldPersistTaps="handled"
				>
					{step === 1 ? renderStepOne() : null}
					{step === 2 ? renderStepTwo() : null}
					{step === 3 ? renderStepThree() : null}
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.footerButtons}>
						<TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
							<Text style={styles.secondaryButtonText}>QUAY LẠI</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.primaryButton} onPress={handlePrimaryAction}>
							<Text style={styles.primaryButtonText}>{step === 3 ? "HOÀN THÀNH" : "TIẾP TỤC"}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
				<RoleMenuOverlay
					visible={!!activeRoleMenuId}
					position={roleMenuPosition}
					activeId={activeRoleMenuId}
					onClose={() => setActiveRoleMenuId(null)}
					onSelect={(r) => {
						setMembers((cur) => cur.map((m) => (m.id === activeRoleMenuId ? { ...m, role: r } : m)));
						setActiveRoleMenuId(null);
					}}
				/>
			</ImageBackground>
	);
}

function RoleMenuOverlay({
	visible,
	position,
	onClose,
	onSelect,
	activeId,
}: {
	visible: boolean;
	position: { x: number; y: number; width: number; height: number } | null;
	onClose: () => void;
	onSelect: (role: Member["role"]) => void;
	activeId: number | null;
}) {
	if (!visible || !position || !activeId) return null;
	const { width: screenWidth } = Dimensions.get("window");
	const menuWidth = 180;
	let left = position.x + position.width - menuWidth;
	if (left < 8) left = 8;
	if (left + menuWidth > screenWidth - 8) left = screenWidth - menuWidth - 8;
	const top = position.y + position.height + 6;

	return (
		<Pressable style={styles.overlayBackdrop} onPress={onClose}>
				<View style={[styles.roleMenuInline, { position: "absolute", left, top }]}> 
					{MEMBER_ROLES.map((r, idx) => {
						const last = idx === MEMBER_ROLES.length - 1;
						return (
							<TouchableOpacity key={r} onPress={() => onSelect(r)} style={[styles.roleMenuItem, last && styles.roleMenuItemLast]}>
								<Text style={styles.roleMenuItemText}>{r}</Text>
							</TouchableOpacity>
						);
					})}
				</View>
		</Pressable>
	);
}

const stylesTokens = {
	primary: "#6236FF",
	softPrimary: "#A58CF5",
	darkText: "#23232D",
	placeholder: "#B8B8C2",
	card: "#FFFFFF",
	divider: "#E7E0FF",
	footer: "#EAE2FF",
	pageBg: "#FBFAFF",
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
		backgroundColor: stylesTokens.pageBg,
	},
	page: {
		flex: 1,
		paddingTop: vw(36),
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: vw(28),
		marginBottom: vw(26),
	},
	backButton: {
		width: vw(44),
		height: vw(44),
		justifyContent: "center",
		alignItems: "flex-start",
	},
	backIcon: {
		width: vw(28),
		height: vw(28),
	},
	title: {
		fontSize: 16,
		fontWeight: "800",
		letterSpacing: 0.5,
		color: stylesTokens.darkText,
	},
	headerSpacer: {
		width: vw(44),
	},
	stepperWrap: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: vw(12),
		paddingHorizontal: vw(28),
	},
	stepRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	stepBubbleWrap: {
		width: vw(52),
		alignItems: "center",
	},
	stepBubble: {
		width: vw(40),
		height: vw(40),
		borderRadius: vw(20),
		backgroundColor: "#E9E3FF",
		alignItems: "center",
		justifyContent: "center",
	},
	stepBubbleActive: {
		backgroundColor: stylesTokens.primary,
	},
	stepBubbleText: {
		fontSize: 12,
		fontWeight: "700",
		color: stylesTokens.primary,
	},
	stepBubbleTextActive: {
		color: "#FFFFFF",
	},
	scrollContent: {
		paddingHorizontal: vw(26),
		paddingBottom: vw(160),
		gap: vw(18),
	},
	input: {
		backgroundColor: "rgba(255,255,255,0.92)",
		borderRadius: vw(28),
		minHeight: vw(56),
		paddingHorizontal: vw(20),
		color: stylesTokens.darkText,
		fontSize: 14,
		borderWidth: 1,
		borderColor: stylesTokens.primary,
	},
	memberSearchArea: {
		position: "relative",
	},
	memberSearchDismiss: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 10,
		backgroundColor: "transparent",
	},
	descriptionInput: {
		minHeight: vw(140),
		paddingTop: vw(18),
		paddingBottom: vw(18),
		paddingHorizontal: vw(34),
		textAlignVertical: "top",
	},
	webDateWrap: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
		gap: 12,
	},
	webDateInput: {
		width: "48%",
		backgroundColor: "rgba(255,255,255,0.92)",
		borderRadius: vw(20),
		minHeight: vw(52),
		paddingHorizontal: vw(12),
		color: stylesTokens.darkText,
		fontSize: 12,
		borderWidth: 1,
		borderColor: stylesTokens.primary,
	},
	card: {
		backgroundColor: stylesTokens.card,
		borderRadius: vw(30),
		paddingHorizontal: vw(28),
		paddingTop: vw(20),
		paddingBottom: vw(22),
		shadowColor: "#8F7EF7",
		shadowOpacity: 0.16,
		shadowRadius: vw(20),
		shadowOffset: { width: 0, height: vw(16) },
		elevation: 4,
		overflow: "visible",
	},
	cardTitle: {
		fontSize: 16,
		lineHeight: 20,
		color: "#121212",
		marginBottom: vw(10),
	},
	cardDivider: {
		height: 2,
		backgroundColor: stylesTokens.divider,
		marginHorizontal: -2,
		marginBottom: vw(14),
	},
	rowDivider: {
		height: 2,
		backgroundColor: stylesTokens.divider,
		marginVertical: vw(14),
	},
	dateRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	dateLabel: {
		fontSize: 14,
		color: "#111111",
	},
	dateChip: {
		backgroundColor: "#E9E3FF",
		paddingHorizontal: vw(18),
		paddingVertical: vw(10),
		borderRadius: vw(16),
	},
	dateChipActive: {
		backgroundColor: "#DDD2FF",
	},
	dateChipText: {
		fontSize: 12,
		color: "#111111",
	},
	dateChipTextActive: {
		fontSize: 12,
		color: stylesTokens.primary,
	},
	uploadBox: {
		borderRadius: vw(28),
		borderWidth: 2,
		borderColor: "#BCA8FF",
		borderStyle: "dashed",
		minHeight: vw(220),
		alignItems: "center",
		justifyContent: "center",
		padding: vw(12),
		backgroundColor: "rgba(255,255,255,0.35)",
	},
	uploadInner: {
		alignItems: "center",
		justifyContent: "center",
		gap: vw(6),
	},
	uploadLabel: {
		color: stylesTokens.softPrimary,
		fontSize: 14,
	},
	searchField: {
		borderWidth: 1,
		borderColor: "#BCA8FF",
		borderRadius: vw(24),
		height: vw(52),
		paddingLeft: vw(20),
		paddingRight: vw(12),
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "rgba(245,240,255,0.72)",
		marginBottom: vw(8),
	},
	searchInput: {
		flex: 1,
		minWidth: 0,
		fontSize: 14,
		color: stylesTokens.softPrimary,
	},
	searchInputWrap: {
		flex: 1,
		minWidth: 0,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	memberSearchDropdown: {
		position: "relative",
		backgroundColor: "rgba(236,230,255,0.95)",
		borderRadius: vw(24),
		borderWidth: 1,
		borderColor: stylesTokens.primary,
		overflow: "hidden",
		marginBottom: vw(18),
		zIndex: 30,
	},
	memberSearchScroll: {
		maxHeight: vw(220),
	},
	memberSearchList: {
		paddingBottom: vw(14),
		paddingTop: vw(8),
	},
	memberSearchRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: vw(20),
		paddingVertical: vw(8),
		borderBottomWidth: 2,
		borderBottomColor: "rgba(123,98,226,0.16)",
	},
	memberSearchName: {
		fontSize: 12,
		color: stylesTokens.darkText,
	},
	addButton: {
		borderWidth: 1,
		borderColor: stylesTokens.primary,
		borderRadius: vw(16),
		paddingHorizontal: vw(10),
		paddingVertical: vw(4),
	},
	addButtonText: {
		fontSize: 12,
		color: stylesTokens.primary,
	},
	memberList: {
		gap: 0,
		marginTop: vw(10),
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: vw(8),
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
		position: "relative",
		overflow: "visible",
	},
	memberName: {
		fontSize: 14,
		color: "#111111",
		flex: 1,
		minWidth: 0,
		marginRight: vw(10),
		marginBottom: 0,
	},
	memberActionsRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		flexShrink: 0,
		gap: 10,
	},
	rolePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: vw(6),
		paddingLeft: vw(10),
		paddingRight: vw(8),
		borderRadius: vw(14),
		flexShrink: 1,
		minWidth: 0,
	},
	rolePillActive: {
		backgroundColor: "#EFE8FF",
		borderWidth: 2,
		borderColor: stylesTokens.primary,
	},
	rolePillText: {
		fontSize: 12,
		color: "#111111",
		flexShrink: 1,
	},
	rolePillTextActive: {
		color: stylesTokens.primary,
	},
	deleteButton: {
		marginLeft: vw(6),
		width: vw(36),
		height: vw(36),
		alignItems: "center",
		justifyContent: "center",
	},
	deleteIcon: {
		width: vw(18),
		height: vw(18),
	},

	caret: {
		width: 0,
		height: 0,
		borderLeftWidth: vw(10),
		borderRightWidth: vw(10),
		borderTopWidth: vw(14),
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderTopColor: "#1C1737",
	},
	caretUp: {
		borderTopWidth: 0,
		borderBottomWidth: vw(14),
		borderTopColor: "transparent",
		borderBottomColor: stylesTokens.primary,
	},
    
	roleMenuInline: {
		position: "absolute",
		backgroundColor: "#FFFFFF",
		borderRadius: vw(16),
		borderWidth: 1,
		borderColor: stylesTokens.primary,
		width: vw(180),
		paddingVertical: vw(6),
		elevation: 50,
		zIndex: 100000,
		shadowColor: "#000",
		shadowOpacity: 0.18,
		shadowRadius: vw(12),
		shadowOffset: { width: 0, height: vw(8) },
	},
	overlayBackdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 100001,
	},
	rolePillWrap: {
		position: "relative",
		alignItems: "flex-end",
		justifyContent: "flex-start",
	},
	memberSearchTop: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: vw(20),
		paddingVertical: vw(8),
		backgroundColor: "rgba(245,240,255,0.95)",
		borderBottomWidth: 1,
		borderBottomColor: stylesTokens.primary,
		borderTopLeftRadius: vw(30),
		borderTopRightRadius: vw(30),
	},
	memberSearchTopInput: {
		flex: 1,
		fontSize: 14,
		color: stylesTokens.darkText,
		paddingRight: vw(12),
	},

	roleMenu: {
		position: "absolute",
		right: 0,
		bottom: vw(74),
		width: vw(250),
		backgroundColor: "#FFFFFF",
		borderRadius: vw(30),
		borderWidth: 1,
		borderColor: stylesTokens.primary,
		overflow: "hidden",
		elevation: 8,
	},
	roleMenuHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: vw(22),
		paddingVertical: vw(10),
		backgroundColor: "#F2ECFF",
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
	},
	roleMenuHeaderText: {
		fontSize: 12,
		color: stylesTokens.darkText,
	},
	roleMenuCaret: {
		width: 0,
		height: 0,
		borderLeftWidth: vw(10),
		borderRightWidth: vw(10),
		borderBottomWidth: vw(16),
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderBottomColor: stylesTokens.primary,
	},
	roleMenuItem: {
		alignItems: "center",
		paddingVertical: vw(10),
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
	},
	roleMenuItemLast: {
		borderBottomWidth: 0,
	},
	roleMenuItemText: {
		fontSize: 12,
		color: stylesTokens.darkText,
	},
	footer: {
		backgroundColor: stylesTokens.footer,
		paddingHorizontal: vw(24),
		paddingTop: vw(18),
		paddingBottom: vw(28),
		borderTopLeftRadius: vw(34),
		borderTopRightRadius: vw(34),
	},
	footerButtons: {
		flexDirection: "row",
		gap: vw(18),
	},
	secondaryButton: {
		flex: 1,
		borderRadius: vw(28),
		borderWidth: 2,
		borderColor: stylesTokens.primary,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: vw(12),
		backgroundColor: "rgba(255,255,255,0.15)",
	},
	secondaryButtonText: {
		fontSize: 14,
		color: stylesTokens.primary,
	},
	primaryButton: {
		flex: 1,
		borderRadius: vw(28),
		backgroundColor: stylesTokens.primary,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: vw(18),
	},
	primaryButtonText: {
		fontSize: 14,
		color: "#FFFFFF",
	},
});
