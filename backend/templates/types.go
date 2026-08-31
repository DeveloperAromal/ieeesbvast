package templates

type InviteData struct {
	Email      string
	Password   string
	InviteLink string
}

type ActivationData struct {
	Name       string
	InviteLink string
}
