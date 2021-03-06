import styled from "@emotion/styled";
import * as React from "react";
import { Mutation, MutationFunction, MutationResult } from "react-apollo";
import ClickOutside from "../components/ClickOutside";
import Command from "../components/icons/Keys/Command";
import Enter from "../components/icons/Keys/Enter";
import Input from "../components/Input";
import Shortcut from "../components/Shortcut";
import { Button } from "../components/StyledComponents";
import { CurrentUser_currentUser } from "../graphql/generated/types";
import { CREATE_CONTACT } from "../graphql/mutations";
import { CURRENT_USER } from "../graphql/queries";
import withShortcuts from "../shortcuts/withShortcuts";
import { CREATE_CONTACT_ERROR, ShortcutProps } from "../types";
import { validateEmail } from "../utils";

type Props = {
  user: CurrentUser_currentUser;
  onHideModal: () => any;
} & ShortcutProps;

type State = {
  email: string;
  firstName: string;
  lastName: string;
  error: CREATE_CONTACT_ERROR | null;
  anotherContact: boolean;
};

class AddContactModal extends React.Component<Props, State> {
  submitFunction: any = null;
  commandSubmitFunction: any = null;

  emailRef = React.createRef<any>();

  state: State = {
    email: "",
    firstName: "",
    lastName: "",
    error: null,
    anotherContact: false,
  };

  UNSAFE_componentWillMount() {
    // Prevent tab switching when at modal
    this.props.manager.bind(
      "tab",
      (ev: any) => {
        ev.stopPropagation();
      },
      this.constructor.name,
      1,
    );
    this.props.manager.bind(
      "enter",
      this.submitFunction,
      this.constructor.name,
      1,
    );
    this.props.manager.bind(
      "command+enter",
      this.commandSubmitFunction,
      this.constructor.name,
      1,
    );
  }

  componentWillUnmount() {
    this.props.manager.unbind("command+enter", this.constructor.name);
    this.props.manager.unbind("enter", this.constructor.name);
  }

  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) {
      return;
    }
    this.setState({
      email: event.target.value,
    });
  };

  onChangeFirstName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) {
      return;
    }
    this.setState({
      firstName: event.target.value,
    });
  };

  onChangeLastName = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event) {
      return;
    }
    this.setState({
      lastName: event.target.value,
    });
  };

  validateFields = () => {
    if (this.state.email == "" || !validateEmail(this.state.email)) {
      this.setState({
        error: CREATE_CONTACT_ERROR.EMAIL,
      });
      return false;
    }

    return true;
  };

  onCreateContact = (data: any) => {
    console.log("CREATED");
    console.log(data);

    if (this.state.anotherContact) {
      this.setState({
        email: "",
        firstName: "",
        lastName: "",
        error: null,
      });
      this.emailRef.current && this.emailRef.current.focus();
    } else {
      this.props.onHideModal();
    }
  };

  render() {
    return (
      <ClickOutside onClickOutside={this.props.onHideModal}>
        <Background onClick={this.props.onHideModal}>
          <Container
            onClick={(ev) => {
              ev.stopPropagation();
            }}>
            <Mutation
              mutation={CREATE_CONTACT}
              onCompleted={this.onCreateContact}
              refetchQueries={[{ query: CURRENT_USER }]}>
              {(
                createContact: MutationFunction,
                { data, loading }: MutationResult,
              ) => {
                const submit = () => {
                  if (!this.validateFields()) {
                    return;
                  }

                  createContact({
                    variables: {
                      input: {
                        email: this.state.email,
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                      },
                    },
                    optimisticResponse: {
                      createContact: {
                        assignee: {
                          id: this.props.user.id,
                          __typename: "User",
                        },
                        firstName: this.state.firstName,
                        lastName: this.state.lastName,
                        __typename: "Contact",
                      },
                    },
                  });
                };

                const submitContact = (another: boolean) => {
                  this.setState(
                    {
                      anotherContact: another,
                    },
                    () => {
                      submit();
                    },
                  );
                };

                this.props.manager.updateCallback(
                  "enter",
                  () => {
                    submitContact(true);
                  },
                  this.constructor.name,
                );
                this.props.manager.updateCallback(
                  "command+enter",
                  () => {
                    submitContact(true);
                  },
                  this.constructor.name,
                );

                return (
                  <Modal>
                    <Header>New Contact</Header>
                    <Body>
                      <Label>EMAIL</Label>
                      <StyledInput
                        ref={this.emailRef}
                        placeholder="Email"
                        value={this.state.email}
                        onChange={this.onChangeEmail}
                        shortcuts={[
                          {
                            keys: ["Meta", "Enter"],
                            callback: () => {
                              submitContact(true);
                            },
                          },
                          {
                            keys: ["Enter"],
                            callback: () => {
                              submitContact(false);
                            },
                          },
                          {
                            keys: ["Escape"],
                            callback: this.props.onHideModal,
                          },
                        ]}
                        autoFocus
                      />
                      <Label>FIRST NAME</Label>
                      <StyledInput
                        placeholder="First Name"
                        value={this.state.firstName}
                        onChange={this.onChangeFirstName}
                        shortcuts={[
                          {
                            keys: ["Meta", "Enter"],
                            callback: () => {
                              submitContact(true);
                            },
                          },
                          {
                            keys: ["Enter"],
                            callback: () => {
                              submitContact(false);
                            },
                          },
                          {
                            keys: ["Escape"],
                            callback: this.props.onHideModal,
                          },
                        ]}
                      />
                      <Label>LAST NAME</Label>
                      <StyledInput
                        placeholder="Last Name"
                        value={this.state.lastName}
                        onChange={this.onChangeLastName}
                        shortcuts={[
                          {
                            keys: ["Meta", "Enter"],
                            callback: () => {
                              submitContact(true);
                            },
                          },
                          {
                            keys: ["Enter"],
                            callback: () => {
                              submitContact(false);
                            },
                          },
                          {
                            keys: ["Escape"],
                            callback: this.props.onHideModal,
                          },
                        ]}
                      />
                      <ButtonRow>
                        <CreateButton
                          onClick={() => {
                            submitContact(false);
                          }}>
                          Create
                          <StyledShortcut>
                            <Enter />
                          </StyledShortcut>
                        </CreateButton>
                        <CreateButton
                          onClick={() => {
                            submitContact(true);
                          }}>
                          Create Another
                          <StyledShortcut>
                            <Command />
                            <Break />
                            <Enter />
                          </StyledShortcut>
                        </CreateButton>
                      </ButtonRow>
                    </Body>
                  </Modal>
                );
              }}
            </Mutation>
          </Container>
        </Background>
      </ClickOutside>
    );
  }
}

export default withShortcuts(AddContactModal);

const StyledShortcut = styled(Shortcut)`
  margin-left: 4px;
`;

const Break = styled.div`
  height: 0px;
  width: 4px;
`;

const CreateButton = styled(Button)`
  flex: 1;
  :last-child {
    margin-left: 10px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;
`;

const Label = styled.div`
  color: rgb(187, 188, 190);
  font-size: 12px;
  display: flex;
  margin-bottom: 4px;
  margin-top: 10px;
  :first-div {
    margin-top: 0px;
  }
`;

const Header = styled.div`
  color: rgb(187, 188, 190);
  display: flex;
  padding: 10px 20px 10px 20px;
  background-color: rgb(45, 47, 49);
  border-top-right-radius: 4px;
  border-top-left-radius: 4px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  background-color: rgb(36, 38, 40);
  padding: 10px 20px 20px 20px;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  height: 100%;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  align-self: center;
  position: absolute;
  left: calc(50% - 200px);
  top: 5%;
  margin: auto;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 60px;
  border-radius: 4px;
  display: flex;
`;

const StyledInput = styled(Input)`
  -webkit-appearance: none;
  border: none;
  background-image: none;
  background-color: rgb(45, 47, 49);
  padding: 10px 12px;
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
  font-size: 14px;
  :focus {
    outline: none;
  }
  ::placeholder {
    color: #a0a0a0;
  }
  color: rgb(244, 244, 246);
`;
