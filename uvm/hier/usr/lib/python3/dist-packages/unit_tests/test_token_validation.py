from uvm import login_tools
from unittest.mock import patch, MagicMock
import unittest
import json


class TestTokenValid(unittest.TestCase):

    def __do_token_run(self, isValid):
        token_value = 'token'
        uid = 'uid'
        with patch('uvm.login_tools.getuid') as mock_getuid:
            mock_getuid.return_value = uid
            if isValid:
                self.assertTrue(login_tools.valid_token(None,
                                                        token_value))
            else:
                self.assertFalse(login_tools.valid_token(
                    None,
                    token_value))

        self.mock_post.assert_called_with(
            login_tools.get_auth_uri(),
            data=json.dumps({'token': token_value, 'resourceId': uid}),
            headers={
                "Content-Type": 'application/json',
                'Accept': 'application/json',
                'AuthRequest': '4E6FAB77-B2DF-4DEA-B6BD-2B434A3AE981'})

    @patch('requests.post')
    def test_token_validity(self, mock_post):
        post_result = MagicMock(return_value=None)
        post_result.raise_for_status = lambda: None
        post_result.json.return_value = True
        self.mock_post = mock_post
        mock_post.return_value = post_result
        self.__do_token_run(True)

    @patch('requests.post')
    def test_invalid_token(self, mock_post):
        post_result = MagicMock(return_value=None)
        post_result.raise_for_status = lambda: None
        post_result.json.return_value = False
        mock_post.return_value = post_result
        self.mock_post = mock_post
        self.__do_token_run(False)

    @patch('requests.post')
    def test_bad_status(self, mock_post):
        post_result = MagicMock(return_value=None)
        post_result.raise_for_status.side_effect = RuntimeError(
            "bad status code")
        post_result.json.return_value = True
        mock_post.return_value = post_result
        self.mock_post = mock_post
        self.__do_token_run(False)
